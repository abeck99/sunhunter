import { IComponentClass, IAsset } from './core/types'
import * as PIXI from "pixi.js"
import * as R from 'ramda'
import { UuidToComponentFunction } from './core/types'
import { Physics } from './physics'


export class Component<TComponentState, TPhysics, TComponents> implements IComponent<TComponentState, TPhysics, TComponents> {
  actor: IActor<TComponents>
  world?: IWorld<TPhysics, TComponents>
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
  }
  removeFromWorldPartTwo = () => {}

  setWorld = (world: IWorld<TPhysics, TComponents>) => {
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




export interface IBoxColliderState {
  x?: number
  y?: number
}

export class BoxColliderComponent extends Component<IBoxColliderState, Physics, IComponents> {
  static defaultState = {
    x: 1,
    y: 1,
  }

  tick = (timeElapsed: number) => {
  }
}

{
 const _: IComponentClass<IBoxColliderState, Physics, IComponents, BoxColliderComponent> = BoxColliderComponent
}

export const boxColliderLens = (world: IWorld<any, IComponents>): UuidToComponentFunction<BoxColliderComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.boxCollider
  })
}



export interface IDragState {
  a?: number
}

export class DragComponent extends Component<IDragState, Physics, IComponents> {
  static defaultState = {
    a: 0,
  }

  tick = (timeElapsed: number) => {
    const v_ = this.actor.components.velocity
    if (v_) {
      const v = v_.state
      const velocityMagnitude = Math.sqrt(v.x*v.x + v.y*v.y)
      const newMag = velocityMagnitude - (this.state.a*timeElapsed)

      if (velocityMagnitude > 0.01) {
        v.x = (v.x/velocityMagnitude)*newMag
        v.y = (v.y/velocityMagnitude)*newMag
      } else {
        v.x = 0
        v.y = 0
      }
    }
  }
}

{
 const _: IComponentClass<IDragState, Physics, IComponents, DragComponent> = DragComponent
}

export const dragLens = (world: IWorld<any, IComponents>): UuidToComponentFunction<DragComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.drag
  })
}



export interface INetState {
  x: boolean
}

export class NetworkedComponent extends Component<INetState, Physics, IComponents> {
  static defaultState = {
    x: true,
  }
}

{
 const _: IComponentClass<INetState, Physics, IComponents, NetworkedComponent> = NetworkedComponent
}

export const netLens = (world: IWorld<any, IComponents>): UuidToComponentFunction<NetworkedComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.net
  })
}



export interface IPositionState {
  x?: number
  y?: number
}

export class PositionComponent extends Component<IPositionState, Physics, IComponents> {
  static defaultState = {
    x: 0,
    y: 0,
  }

  tick = (timeElapsed: number) => {
  }

  updatePosition = (newX: number, newY: number) => {
    
  }
}

{
 const _: IComponentClass<IPositionState, Physics, IComponents, PositionComponent> = PositionComponent
}

export const positionLens = (world: IWorld<any, IComponents>): UuidToComponentFunction<PositionComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.position
  })
}



export interface ISpriteState {
  asset: IAsset
}

export class SpriteComponent extends Component<ISpriteState, Physics, IComponents> {
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
    const pos = this.actor.components.position
    if (this.sprite && pos) {
      this.sprite.x = pos.state.x
      this.sprite.y = pos.state.y
    }
  }
}

{
 const _: IComponentClass<ISpriteState, Physics, IComponents, SpriteComponent> = SpriteComponent
}

export const spriteLens = (world: IWorld<any, IComponents>): UuidToComponentFunction<SpriteComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.sprite
  })
}



export interface IVelocityState {
  x?: number
  y?: number
}

export class VelocityComponent extends Component<IVelocityState, Physics, IComponents> {
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
 const _: IComponentClass<IVelocityState, Physics, IComponents, VelocityComponent> = VelocityComponent
}

export const velocityLens = (world: IWorld<any, IComponents>): UuidToComponentFunction<VelocityComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.velocity
  })
}




export interface IComponentsState {

boxCollider?: IBoxColliderState

drag?: IDragState

net?: INetState

position?: IPositionState

sprite?: ISpriteState

velocity?: IVelocityState

}

export interface IComponents {

boxCollider?: BoxColliderComponent

drag?: DragComponent

net?: NetworkedComponent

position?: PositionComponent

sprite?: SpriteComponent

velocity?: VelocityComponent

}

const componentClasses = {

boxCollider: BoxColliderComponent,

drag: DragComponent,

net: NetworkedComponent,

position: PositionComponent,

sprite: SpriteComponent,

velocity: VelocityComponent,

}



// Concrete classes using definitions
import { ActorFactory } from './core/actors'
import { World } from './core/world'
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
export const makeWorld = (): World<Physics, IComponents> => {
  return new World<Physics, IComponents>(new Physics(), factory)
}


