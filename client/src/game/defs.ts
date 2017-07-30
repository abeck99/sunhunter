import { IComponentClass, IAsset } from './core/types'
import * as PIXI from "pixi.js"
import * as R from 'ramda'
import { LensFunction } from './core/types'
import { Physics } from './physics'
import { IVector2d } from './util/math'
import { CAMERA, SCREEN } from './util'


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

  dispatchAddRemoveIfNeeded = (previousWorld: IWorld<TPhysics, TComponents>) => {
    if (!this.wasAddedToWorld && this.shouldBeInWorld()) {
      this.wasAddedToWorld = true
      this.addToWorldPartTwo()
    } else if (this.wasAddedToWorld && !this.shouldBeInWorld()) {
      this.wasAddedToWorld = false
      const tempWorld = this.world
      // Set to previous world temporarily to allow detatching
      this.world = previousWorld
      this.removeFromWorldPartTwo()
      this.world = tempWorld
    }
  }

  addToWorldPartTwo = () => {
  }
  removeFromWorldPartTwo = () => {}

  setWorld = (world: IWorld<TPhysics, TComponents>) => {
    const previousWorld = this.world
    this.world = world
    this.dispatchAddRemoveIfNeeded(previousWorld)
  }

  setLoaded = (isLoaded: boolean) => {
    this.loaded = isLoaded
    this.dispatchAddRemoveIfNeeded(this.world)
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

export const boxColliderLens = (world: IWorld<any, IComponents>): LensFunction<BoxColliderComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.boxCollider
  })
}

export const boxColliderStateLens = (world: IWorld<any, IComponents>): LensFunction<IBoxColliderState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.boxCollider.state
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

export const dragLens = (world: IWorld<any, IComponents>): LensFunction<DragComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.drag
  })
}

export const dragStateLens = (world: IWorld<any, IComponents>): LensFunction<IDragState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.drag.state
  })
}



export interface IFollowState {
  t?: string
  d?: number
}

export class FollowComponent extends Component<IFollowState, Physics, IComponents> {
  static defaultState = {
    t: null,
    d: 0.5,
  }

  getPos?: LensFunction<IPositionState>
  addToWorldPartTwo = () => {
    this.getPos = positionStateLens(this.world)
  }
  removeFromWorldPartTwo = () => {
    this.getPos = null
  }

  tick = (timeElapsed: number) => {
    const myPos = this.actor.components.position
    if (!myPos || !this.getPos) {
      return
    }

    const targetPos = this.getPos(this.state.t)
    if (!targetPos) {
      return
    }

    const d = this.state.d
    const dI = 1.0 - d
    myPos.state.x = (myPos.state.x*d) + (targetPos.x*dI)
    myPos.state.y = (myPos.state.y*d) + (targetPos.y*dI)
  }
}

{
 const _: IComponentClass<IFollowState, Physics, IComponents, FollowComponent> = FollowComponent
}

export const followLens = (world: IWorld<any, IComponents>): LensFunction<FollowComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.follow
  })
}

export const followStateLens = (world: IWorld<any, IComponents>): LensFunction<IFollowState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.follow.state
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

export const netLens = (world: IWorld<any, IComponents>): LensFunction<NetworkedComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.net
  })
}

export const netStateLens = (world: IWorld<any, IComponents>): LensFunction<INetState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.net.state
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

export const positionLens = (world: IWorld<any, IComponents>): LensFunction<PositionComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.position
  })
}

export const positionStateLens = (world: IWorld<any, IComponents>): LensFunction<IPositionState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.position.state
  })
}



export interface IScreenAttributesState {
  w?: number
  h?: number
}

export class ScreenAttributesComponent extends Component<IScreenAttributesState, Physics, IComponents> {
  static defaultState = {
    w: 0,
    h: 0,
  }

  tick = (timeElapsed: number) => {

  }

  pixelsFromWorld = (coords: IVector2d): IVector2d => {
    // For now 1:1 ratio between world space and pixel space
    return {
      x: coords.x + (this.state.w*0.5),
      y: (-1*coords.y) + (this.state.h*0.5),
    }
  }
}

{
 const _: IComponentClass<IScreenAttributesState, Physics, IComponents, ScreenAttributesComponent> = ScreenAttributesComponent
}

export const screenLens = (world: IWorld<any, IComponents>): LensFunction<ScreenAttributesComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.screen
  })
}

export const screenStateLens = (world: IWorld<any, IComponents>): LensFunction<IScreenAttributesState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.screen.state
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

  getPos?: LensFunction<PositionComponent>
  getScreen?: LensFunction<ScreenAttributesComponent>
  addToWorldPartTwo = () => {
    this.sprite = new PIXI.Sprite(this.world.getTexture(this.state.asset))
    this.world.container.addChild(this.sprite)
    this.getPos = positionLens(this.world)
    this.getScreen = screenLens(this.world)
  }

  removeFromWorldPartTwo = () => {
    this.world.container.removeChild(this.sprite)
    this.sprite = null
    this.getPos = null
    this.getScreen = null
  }

  tick = (timeElapsed: number) => {
    const pos = this.actor.components.position
    if (!this.sprite || !pos || !this.getPos || !this.getScreen) {
      return
    }

    const cameraPos = this.getPos(CAMERA)
    const screen = this.getScreen(SCREEN)
    if (!cameraPos || !screen) {
      return
    }

    const { x, y } = screen.pixelsFromWorld({
      x: pos.state.x - cameraPos.state.x,
      y: pos.state.y - cameraPos.state.y,
    })

    this.sprite.x = x 
    this.sprite.y = y
  }
}

{
 const _: IComponentClass<ISpriteState, Physics, IComponents, SpriteComponent> = SpriteComponent
}

export const spriteLens = (world: IWorld<any, IComponents>): LensFunction<SpriteComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.sprite
  })
}

export const spriteStateLens = (world: IWorld<any, IComponents>): LensFunction<ISpriteState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.sprite.state
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

export const velocityLens = (world: IWorld<any, IComponents>): LensFunction<VelocityComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.velocity
  })
}

export const velocityStateLens = (world: IWorld<any, IComponents>): LensFunction<IVelocityState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.velocity.state
  })
}




export interface IComponentsState {

boxCollider?: IBoxColliderState

drag?: IDragState

follow?: IFollowState

net?: INetState

position?: IPositionState

screen?: IScreenAttributesState

sprite?: ISpriteState

velocity?: IVelocityState

}

export interface IComponents {

boxCollider?: BoxColliderComponent

drag?: DragComponent

follow?: FollowComponent

net?: NetworkedComponent

position?: PositionComponent

screen?: ScreenAttributesComponent

sprite?: SpriteComponent

velocity?: VelocityComponent

}

const componentClasses = {

boxCollider: BoxColliderComponent,

drag: DragComponent,

follow: FollowComponent,

net: NetworkedComponent,

position: PositionComponent,

screen: ScreenAttributesComponent,

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


