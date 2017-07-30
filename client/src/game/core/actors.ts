import * as Promise from 'bluebird'
import { Sprite, loader, Container } from "pixi.js"
import { IActor, IActorClass, IComponentClass, IActorFactory } from './types'
import * as R from 'ramda'

const debugLog = (s: string) => {
  //console.log(s)
}

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
  [key: string]: IComponentClass<any, any, TComponents, any>
}

export class ActorFactory<TComponents> implements IActorFactory<TComponents> {
  loadStates: {
    [key: string]: LoadState
  }
  loadPromises: ILoadPromise[]
  componentClasses: IComponentClassCollection<TComponents>

  pendingLoads: IAsset[]

  constructor(componentClasses: IComponentClassCollection<TComponents>) {
    this.loadStates = {}
    this.loadPromises = []
    this.componentClasses = componentClasses
    this.pendingLoads = []
  }

  finishLoad = (assetKeys: string[]) => {
    for (const assetKey of assetKeys) {
      this.loadStates[assetKey] = LoadState.Loaded
    }

    debugLog(`current load states: ${this.loadStates}`)

    const hasLoadedAllAssetKeys = R.all((assetKey: string): boolean => {
      return this.loadStates[assetKey] == LoadState.Loaded
    })

    debugLog(`Finsihed loading ${assetKeys}`)

    // Dispatch promises
    var newLoadPromises: ILoadPromise[] = []
    for (const loadPromise of this.loadPromises) {
      if (hasLoadedAllAssetKeys(loadPromise.assetKeys)) {

        debugLog('found someone waiting...')
        loadPromise.promise.resolve(true)
      } else {

        debugLog('hmm this guys still watiing on something')
        newLoadPromises.push(loadPromise)
      }
    }
    this.loadPromises = newLoadPromises

    this.dispatchPendingLoads()
  }

  dispatchPendingLoads = () => {
    const assetKeys = R.keys(this.pendingLoads)

    if (assetKeys.length == 0) {
      return
    }

    for (const assetKey of assetKeys) {
      if (this.loadStates[assetKey] == LoadState.Loaded) {
        // Should never happen but sanity check in case theres a bug
        console.log(`Progreammer error here!! Asset ${assetKey} was already ${this.loadStates[assetKey]}`)
      } else {
        this.loadStates[assetKey] = LoadState.Pending
      }
    }

    // Loader can't handle multiple requests at once, so we defer until the previous finishes
    //    This also assumes that NOONE ELSE is call loader...
    if (loader.loading) {
      debugLog('already loading something, bailing out')
      return
    }

    const assetsToLoadByKey = this.pendingLoads
    this.pendingLoads = []
    const assetsToLoad = R.values(assetsToLoadByKey)

    loader.add(R.values(assetsToLoadByKey)).load(() => {
      this.finishLoad(assetKeys)
    })
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
        for (const assetKey of assetKeys) {
          if (this.loadStates[assetKey] == undefined) {
            this.pendingLoads[assetKey] = assetsByKey[assetKey]
          }
        }

        this.dispatchPendingLoads()
      }

      // When promise completes, all assets are loaded
      promise.then(() => {
        newComponent.setLoaded(true)
      })
    }, actorState)

    return actor
  }
}
