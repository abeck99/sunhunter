import { Container } from "pixi.js"
import * as Promise from 'bluebird'

export interface IAsset {
  url: string
}


// Function Signatures
export type TickFunction = (timeElapsed: number) => void


// Component definitions
export interface IComponent<TComponentConfig, TComponents> {
  actor: IActor<TComponents>
  init: (config: TComponentConfig) => void
  addToWorld: (world: IWorld<TComponents>) => void
  removeFromWorld: (world: IWorld<TComponents>) => void
  tick: TickFunction
}

export interface IComponentClass<TComponentConfig, TComponents, InstanceType extends IComponent<TComponentConfig, TComponents>> {
  new(actor: IActor<TComponents>, config: TComponentConfig): IComponent<TComponentConfig, TComponents>
  assetsToLoad: (config: TComponentConfig) => IAsset[]
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
  spawn: <TConfig, T extends IActor<TComponents>>(cls: IActorClass<TConfig, TComponents, T>, config: TConfig) => ISpawnInfo<T>
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
  create: <TConfig, T extends IActor<TComponents>>(uuid: string, cls: IActorClass<TConfig, TComponents, T>, inConfig: TConfig) => Promise<T>
}
