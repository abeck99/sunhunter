import { Container, Texture } from "pixi.js"
import * as Promise from 'bluebird'

export interface IAsset {
  url: string
}


// Function Signatures
export type TickFunction = (timeElapsed: number) => void


// Component definitions
export interface IComponent<TComponentState, TPhysics, TComponents> {
  actor: IActor<TComponents>
  tick: TickFunction

  addToWorldPartTwo: () => void
  removeFromWorldPartTwo: () => void

  setWorld: (world: IWorld<TPhysics, TComponents>) => void
  setLoaded: (isLoaded: boolean) => void

  getState: () => TComponentState
}

export interface IComponentClass<TComponentState, TPhysics, TComponents, InstanceType extends IComponent<TComponentState, TPhysics, TComponents>> {
  new(actor: IActor<TComponents>, state: TComponentState): IComponent<TComponentState, TPhysics, TComponents>
  assetsToLoad?: (state: TComponentState) => IAsset[]
  defaultState: TComponentState
}
// validate class static methods with 
// const _: IComponentClass<SomeConfig, any, SomeComponentClass> = SomeComponentClass<SomeConfig>



// World definitions
export type LensFunction<T> = (uuid: string) => T

export interface IWorld<TPhysics, TComponents> {
  container: Container
  physics: TPhysics
  root: IActor<TComponents>

  tick: TickFunction
  
  spawn: <TComponentsState>(cls: IActorClass<TComponentsState, TComponents, IActor<TComponents>>, state: TComponentsState) => IActor<TComponents>
  spawnWithId: <TComponentsState>(uuid: string, cls: IActorClass<TComponentsState, TComponents, IActor<TComponents>>, state: TComponentsState) => IActor<TComponents>
  removeActorFromWorld: (actor: IActor<TComponents>) => void
  removeActorFromWorldWithId: (uuid: string) => void

  getTexture: (asset: IAsset) => Texture
  serialize: () => string
  deserialize: <TComponentsState>(serializedState: string, isCopy: boolean, cls: IActorClass<TComponentsState, TComponents, IActor<TComponents>>) => void

  getActor: (uuid: string) => IActor<TComponents>

  lens: <T>(lensFunc: (actor: IActor<TComponents>) => T) => LensFunction<T>
}


// Actor definitions
export interface IActor<TComponents> {
  uuid: string
  components: TComponents
  getState: <TComponentsState>() => IActorState<TComponentsState>
}

export interface IActorState<TComponentsState> {
  uuid: string
  state: TComponentsState
}

export interface IActorClass<TComponentsState, TComponents, InstanceType extends IActor<TComponents>> {
  new(uuid: string): IActor<TComponents>
  defaults: TComponentsState
}

// validate class static methods with 
// const _: IActorClass<TAssets, TLoadedAssets, TComponents, SomeActorClass> = SomeActorClass<TComponents>

export interface IActorFactory<TComponents> {
  create: <TActorState>(uuid: string, cls: IActorClass<TActorState, TComponents, IActor<TComponents>>, inState: TActorState) => IActor<TComponents>
}
