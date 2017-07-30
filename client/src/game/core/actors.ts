import * as Promise from 'bluebird'
import { Sprite, loader, Container } from "pixi.js"
import { IActor, IActorClass, IComponentClass, IActorFactory } from './types'
import * as R from 'ramda'

interface IAsset {
  url: string
}

const assetToUniqueKey = (asset: IAsset): string => {
  return asset.url
}

interface IAssetCollection {
  [key: string]: IAsset
}

const getAssetsByKey = (assets: IAsset[]): IAssetCollection => {
  var collection: IAssetCollection = {}
  for (const asset of assets) {
    const assetKey = assetToUniqueKey(asset)
    collection[assetKey] = asset
  }
  return collection
}

interface ILoadPromise {
  assetKeys: string[]
  promise: Promise<boolean>
}

enum LoadState {
  Pending = 1,
  Loaded
}

function defer() {
    var res, rej;

    var promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
    });

    promise.resolve = res;
    promise.reject = rej;

    return promise;
}

interface IComponentClassCollection<TComponents> {
  [key: string]: IComponentClass<any, TComponents, any>
}

export class ActorFactory<TComponents> implements IActorFactory<TComponents> {
  loadStates: {
    [key: string]: LoadState
  }
  loadPromises: ILoadPromise[]
  componentClasses: IComponentClassCollection<TComponents>

  constructor(componentClasses: IComponentClassCollection<TComponents>) {
    this.loadStates = {}
    this.loadPromises = []
    this.componentClasses = componentClasses
  }

  finishLoad = (assetKeys: string[]) => {
    for (const assetKey of assetKeys) {
      this.loadStates[assetKey] = LoadState.Loaded
    }

    const hasLoadedAllAssetKeys = R.all((assetKey: string): boolean => {
      return this.loadStates[assetKey] == LoadState.Loaded
    })

    console.log(`Finsihed loading ${assetKeys}`)

    // Dispatch promises
    var newLoadPromises: ILoadPromise[] = []
    for (const loadPromise of this.loadPromises) {
      if (hasLoadedAllAssetKeys(loadPromise.assetKeys)) {

        console.log('found someone waiting...')
        loadPromise.promise.resolve(true)
      } else {

        console.log('hmm this guys still watiing on something')
        newLoadPromises.push(loadPromise)
      }
    }
    this.loadPromises = newLoadPromises
  }

  create = <TActorState>(uuid: string, cls: IActorClass<TActorState, TComponents, IActor<TComponents>>, inState: TActorState): IActor<TComponents> => {
    const actor = new cls(uuid)

    const promise = defer()

    const actorState = R.merge(cls.defaults, inState)

    R.mapObjIndexed((inComponentState, componentName) => {
      const promise = defer()

      const componentClass = this.componentClasses[componentName]
      
      if (!componentClass) {
        console.log(`Unknown component ${componentName}`)
        return
      }

      const componentState = R.merge(componentClass.defaultState, inComponentState)
      const newComponent = new componentClass(actor, componentState)
      actor.components[componentName] = newComponent

      const assetsFunc = componentClass.assetsToLoad
      const assetsRequested = assetsFunc ? assetsFunc(componentState) : []
      const assetsByKey = getAssetsByKey(assetsRequested)
      const assetKeys = R.keys(assetsByKey)

      const hasLoadedAllAssetKeys = R.all((assetKey: string): boolean => {
        return this.loadStates[assetKey] == LoadState.Loaded
      })

      // All assets are loaded (note this returns true on an empty list too) so immediately resolve promise
      if (hasLoadedAllAssetKeys(assetKeys)) {
        promise.resolve(true)
      } else {
        this.loadPromises.push({
          assetKeys, promise
        })

        // Search for any assets not currently loading (prevent two attempted loads at once)
        var assetKeysToLoad: string[] = []
        for (const assetKey of assetKeys) {
          if (this.loadStates[assetKey] == undefined) {
            assetKeysToLoad.push(assetKey)
          }
        }
  
        // If assetKeysToLoad.length is 0 then all assets were already pending load so no work is required
        // Otherwise start loading the ones that weren't pending
        if (assetKeysToLoad.length > 0) {
          const assetsToLoadByKey: IAssetCollection = R.pick(
            assetKeysToLoad, assetsByKey
          )
          const assetsToLoad = R.values(assetsToLoadByKey)
  
          console.log(`loading assets .. ${assetsToLoad.length} --- ${assetsToLoad}`)
  
          for (const assetKey of assetsToLoad) {
            console.log(`key: ${assetKey}`)
          }
  
          loader.add(assetsToLoad).load(() => {
            this.finishLoad(assetKeysToLoad)
          })
        }
      }

      // When promise completes, all assets are loaded
      promise.then(() => {
        newComponent.setLoaded(true)
      })
    }, actorState)

    return actor
  }
}
