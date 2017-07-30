import { Container, Texture } from "pixi.js"
import * as Promise from 'bluebird'

export interface IAsset {
  url: string
}


// Function Signatures
export type TickFunction = (timeElapsed: number) => void


// Component definitions
export interface IComponent<TComponentConfig, TComponents> {
  actor: IActor<TComponents>
  tick: TickFunction

  addToWorldPartTwo: () => void
  removeFromWorldPartTwo: () => void

  setWorld: (world: IWorld<TComponents>) => void
  setLoaded: (isLoaded: boolean) => void
}

export interface IComponentClass<TComponentConfig, TComponents, InstanceType extends IComponent<TComponentConfig, TComponents>> {
  new(actor: IActor<TComponents>, config: TComponentConfig): IComponent<TComponentConfig, TComponents>
  assetsToLoad?: (config: TComponentConfig) => IAsset[]
  configDefaults: TComponentConfig
}
// validate class static methods with 
// const _: IComponentClass<SomeConfig, any, SomeComponentClass> = SomeComponentClass<SomeConfig>



// World definitions
export interface ISpawnInfo<T> {
  uuid: string
  promise: Promise<T>
}

export interface IWorld<TComponents> {
  container: Container
  getView: () => HTMLElement
  spawn: <TConfig>(cls: IActorClass<TConfig, TComponents, IActor<TComponents>>, config: TConfig) => IActor<TComponents>
  getTexture: (asset: IAsset) => Texture
}



// Actor definitions
export interface IActor<TComponents> {
  uuid: string
  components: TComponents
}

export interface IActorClass<TConfig, TComponents, InstanceType extends IActor<TComponents>> {
  new(uuid: string): IActor<TComponents>
  defaults: TConfig
}

// validate class static methods with 
// const _: IActorClass<TAssets, TLoadedAssets, TComponents, SomeActorClass> = SomeActorClass<TComponents>

export interface IActorFactory<TComponents> {
  create: <TConfig>(uuid: string, cls: IActorClass<TConfig, TComponents, IActor<TComponents>>, inConfig: TConfig) => IActor<TComponents>
}
