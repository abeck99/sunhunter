import { IComponentClass, IAsset } from './core/types'
import * as PIXI from "pixi.js"
import * as R from 'ramda'


export class Component<TComponentState, TComponents> implements IComponent<TComponentState, TComponents> {
  actor: IActor<TComponents>
  world?: IWorld<TComponents>
  state: TComponentState

  constructor(actor: IActor<TComponents>, state: TComponentState) {
    this.actor = actor
    this.loaded = false
    this.wasAddedToWorld = false
    this.state = state
  }

  loaded: boolean
  wasAddedToWorld: boolean

  shouldBeInWorld = (): boolean => {
    return this.world && this.loaded
  }

  dispatchAddRemoveIfNeeded = () => {
    if (!this.wasAddedToWorld && this.shouldBeInWorld()) {
      this.wasAddedToWorld = true
      this.addToWorldPartTwo()
    } else if (this.wasAddedToWorld && !this.shouldBeInWorld()) {
      this.wasAddedToWorld = false
      this.removeFromWorldPartTwo()
    }
  }

  addToWorldPartTwo = () => {
    console.log("SHOLDNO BE HERE")
  }
  removeFromWorldPartTwo = () => {}

  setWorld = (world: IWorld<TComponents>) => {
    this.world = world
    this.dispatchAddRemoveIfNeeded()
  }

  setLoaded = (isLoaded: boolean) => {
    this.loaded = isLoaded
    this.dispatchAddRemoveIfNeeded()
  }

  tick = (elapsedTime: number) => {}

  getState = (): TComponentState => {
    return this.state
  }
}




export interface IDragState {
  x?: number
  y?: number
}

export class DragComponent extends Component<IDragState, IComponents> {
  static defaultState = {
    x: 0,
    y: 0,
  }

  tick = (timeElapsed: number) => {
    if (this.actor.components.velocity) {
      this.actor.components.velocity.state.x = Math.max(0, this.actor.components.velocity.state.x - (this.state.x*timeElapsed))
      this.actor.components.velocity.state.y = Math.max(0, this.actor.components.velocity.state.y - (this.state.y*timeElapsed))
    }
  }
}

{
 const _: IComponentClass<IDragState, IComponents, DragComponent> = DragComponent
}


export interface INetState {
  x: boolean
}

export class NetworkedComponent extends Component<INetState, IComponents> {
  static defaultState = {
    x: true,
  }
}

{
 const _: IComponentClass<INetState, IComponents, NetworkedComponent> = NetworkedComponent
}


export interface IPositionState {
  x?: number
  y?: number
}

export class PositionComponent extends Component<IPositionState, IComponents> {
  static defaultState = {
    x: 0,
    y: 0,
  }

  tick = (timeElapsed: number) => {
  }
}

{
 const _: IComponentClass<IPositionState, IComponents, PositionComponent> = PositionComponent
}


export interface ISpriteState {
  asset: IAsset
}

export class SpriteComponent extends Component<ISpriteState, IComponents> {
  static defaultState = {
    asset: {
      url: 'none'
    }
  }

  sprite?: PIXI.Sprite

  static assetsToLoad = (state: ISpriteState): IAsset[] => {
    return [
      state.asset
    ]
  }

  addToWorldPartTwo = () => {
    this.sprite = new PIXI.Sprite(this.world.getTexture(this.state.asset))
    this.world.container.addChild(this.sprite)
  }

  tick = (timeElapsed: number) => {
    if (this.sprite && this.actor.components.position) {
      this.sprite.x = this.actor.components.position.state.x
      this.sprite.y = this.actor.components.position.state.y
    }
  }
}

{
 const _: IComponentClass<ISpriteState, IComponents, SpriteComponent> = SpriteComponent
}


export interface IVelocityState {
  x?: number
  y?: number
}

export class VelocityComponent extends Component<IVelocityState, IComponents> {
  static defaultState = {
    x: 0,
    y: 0,
  }

  tick = (timeElapsed: number) => {
    if (this.actor.components.position) {
      this.actor.components.position.state.x += this.state.x*timeElapsed
      this.actor.components.position.state.y += this.state.y*timeElapsed
    }
  }

  applyForce = (x: number, y: number) => {
    this.state.x += x
    this.state.y += y
  }
}

{
 const _: IComponentClass<IVelocityState, IComponents, VelocityComponent> = VelocityComponent
}



export interface IComponentsState {

drag?: IDragState

net?: INetState

position?: IPositionState

sprite?: ISpriteState

velocity?: IVelocityState

}

export interface IComponents {

drag?: DragComponent

net?: NetworkedComponent

position?: PositionComponent

sprite?: SpriteComponent

velocity?: VelocityComponent

}

const componentClasses = {

drag: DragComponent,

net: NetworkedComponent,

position: PositionComponent,

sprite: SpriteComponent,

velocity: VelocityComponent,

}



// Concrete classes using definitions
import { ActorFactory } from './core/actors'
import { World, IWorldConfig } from './core/world'
import { IActor, IWorld, IComponent, IActorState } from './core/types'

export class Actor implements IActor<IComponents> {
  uuid: string
  components: IComponents

  static defaults: IComponentsState = {}

  constructor(uuid: string) {
    this.uuid = uuid
    this.components = {}
  }

  getState = <TComponentsState>(): IActorState<TComponentsState> => {
    var state = {} as TComponentsState

    R.mapObjIndexed((component, componentName) => {
      state[componentName] = component.getState()
    }, this.components)

    return {
      uuid: this.uuid,
      state: state,
    }
  }
}

export const factory = new ActorFactory<IComponents>(componentClasses)
export const makeWorld = (worldConfig: IWorldConfig): World<IComponents> => {
  return new World<IComponents>(worldConfig, factory)
}


