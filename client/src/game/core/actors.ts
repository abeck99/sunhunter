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

    // Dispatch promises
    var newLoadPromises: ILoadPromise[] = []
    for (const loadPromise of this.loadPromises) {
      if (hasLoadedAllAssetKeys(loadPromise.assetKeys)) {
        loadPromise.promise.resolve(true)
      } else {
        newLoadPromises.push(loadPromise)
      }
    }
    this.loadPromises = newLoadPromises
  }

  create = <TConfig, T extends IActor<TComponents>>(uuid: string, cls: IActorClass<TConfig, TComponents, T>, inConfig: TConfig): Promise<T> => {
    const promise = defer()

    const config = R.merge(cls.defaults, inConfig)

    const assetsRequested: IAsset[] = [] 
    R.mapObjIndexed((componentConfig, componentName) => {
        const componentClass = this.componentClasses[componentName]
        if (componentClass) {
          for (const asset of componentClass.assetsToLoad(componentConfig)) {
            assetsRequested.push(asset)
          }
        }
      }, config)

    const assetsByKey = getAssetsByKey(assetsRequested)
    const assetKeys = R.keys(assetsByKey)

    const hasLoadedAllAssetKeys = R.all((assetKey: string): boolean => {
      return this.loadStates[assetKey] == LoadState.Loaded
    })

    // TODO: Defer loading specific components based on assets, and create the actor immediately
    if (hasLoadedAllAssetKeys(assetKeys)) {
      promise.resolve(true)
    } else {
      this.loadPromises.push({
        assetKeys, promise
      })

      var assetKeysToLoad: string[] = []
      for (const assetKey in assetKeys) {
        if (this.loadStates[assetKey] == undefined) {
          assetKeysToLoad.push(assetKey)
        }
      }

      if (assetKeysToLoad.length > 0) {
        const assetsToLoadByKey: IAssetCollection = R.pick(
          assetKeysToLoad, assetsByKey
        )
        const assetsToLoad = R.values(assetsToLoadByKey)
        loader.add(assetsToLoad).load(() => {
          this.finishLoad(assetKeysToLoad)
        })
      }
    }

    return promise.then(() => {
      const actor = new cls(uuid)

      R.mapObjIndexed((componentConfig, componentName) => {
        const componentClass = this.componentClasses[componentName]
        if (componentClass) {
          const newComponent = new componentClass(actor, componentConfig)
          actor.components[componentName] = newComponent
        }
      }, config)

      return actor
    })
  }
}
