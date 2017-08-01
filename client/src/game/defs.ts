import { IComponentClass, IAsset } from './core/types'
import * as PIXI from "pixi.js"
import * as R from 'ramda'
import { LensFunction } from './core/types'
import { Physics } from './physics'
import { IVector2d, IBounds, IRay, add2dMut } from './util/math'
import { CAMERA } from './util'

// TODO: this shouldn't be in core
import { ForceType, Force } from './physics'


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
  w?: number
  h?: number
  isStatic?: boolean
}

export class BoxColliderComponent extends Component<IBoxColliderState, Physics, IComponents> {
  static defaultState = {
    w: 1,
    h: 1,
    isStatic: false,
  }

  bounds?: IBounds
  partitionId?: string

  addToWorldPartTwo = () => {
    console.log('a')
    const pos = this.actor.components.position

    if (pos) {
      this.bounds = {
        uuid: this.actor.uuid,
        topLeft: {x: pos.state.x, y: pos.state.y},
        width: this.state.w,
        height: this.state.h,
      }
    }

    if (this.bounds && this.state.isStatic) {
      this.partitionId = this.world.physics.addToWorld(this.bounds)
    }
  }

  removeFromWorldPartTwo = () => {
    const partitionId = this.partitionId
    this.partitionId = null

    if (partitionId) {
      this.world.physics.removeFromWorld(partitionId, this.actor.uuid)
    }
  }

  getFrontalArea = () => {
    return 0.5*(this.state.w+this.state.h)
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



export interface IMovementState {
  vel: IVector2d
  acc: IVector2d
  force: IVector2d
}

export class MovementComponent extends Component<IMovementState, Physics, IComponents> {
  static defaultState = {
    vel: {x:0, y:0},
    acc: {x:0, y:0},
    force: {x:0, y:0},
  }

  applyForce = (force: IVector2d) => {
    add2dMut(this.state.force, force)
  }

  tick = (timeElapsed: number) => {
    const objectPhysics = this.actor.components.objectPhysics
    const worldPhysics = this.world.root.components.worldPhysics
    const pos = this.actor.components.position

    if (!objectPhysics || !worldPhysics || !worldPhysics.forces || !pos) {
      return
    }

    const forces = R.append({type: ForceType.Acceleration, v: this.state.force}, worldPhysics.forces)

    this.world.physics.moveMut(pos.state, this.state.vel, this.state.acc, objectPhysics.state, forces, timeElapsed)
  }
}

{
 const _: IComponentClass<IMovementState, Physics, IComponents, MovementComponent> = MovementComponent
}

export const movementLens = (world: IWorld<any, IComponents>): LensFunction<MovementComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.movement
  })
}

export const movementStateLens = (world: IWorld<any, IComponents>): LensFunction<IMovementState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.movement.state
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



import { IObjectProperties } from './physics'

export class ObjectPhysicsComponent extends Component<IObjectProperties, Physics, IComponents> {
  static defaultState = {
    mass: 0.1,
    bounce: 0.1,
    drag: {x: 0.47, y: 0.47},
    frontalArea: 1 / 1000,
  }

  tick = (timeElapsed: number) => {
    const worldForces = this.world.root.components.worldPhysics || []

  }
}

export interface IObjectProperties {
  mass: number
  bounce: number
  drag: IVector2d // 0.47 for ball, 1.05 for cube, 0.82 for long cylinder, 0.04 for streamlined object
                  // This of course varies if you're moving left or right, but simplifying it on just x/y axis
  frontalArea: number // This of course varies by direction...
}

{
 const _: IComponentClass<IObjectProperties, Physics, IComponents, ObjectPhysicsComponent> = ObjectPhysicsComponent
}

export const objectPhysicsLens = (world: IWorld<any, IComponents>): LensFunction<ObjectPhysicsComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.objectPhysics
  })
}

export const objectPhysicsStateLens = (world: IWorld<any, IComponents>): LensFunction<IObjectProperties> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.objectPhysics.state
  })
}



export interface IPositionState {
  x: number
  y: number
}

export class PositionComponent extends Component<IPositionState, Physics, IComponents> {
  static defaultState = {
    x: 0,
    y: 0,
  }

  tick = (timeElapsed: number) => {
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
  debugPoint?: PIXI.Graphics

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

    this.debugPoint = new PIXI.Graphics()
    this.debugPoint.lineStyle(2, 0xFF0000, 1)
    this.debugPoint.moveTo(-4, -4)
    this.debugPoint.lineTo(4,4)
    this.debugPoint.moveTo(-4,4)
    this.debugPoint.lineTo(4,-4)
    this.sprite.addChild(this.debugPoint)
  }

  removeFromWorldPartTwo = () => {
    this.world.container.removeChild(this.sprite)
    this.sprite = null
    this.getPos = null
    this.getScreen = null
  }

  tick = (timeElapsed: number) => {
    const pos = this.actor.components.position
    const screen = this.world.root.components.screen
    if (!this.sprite || !pos || !this.getPos || !screen) {
      return
    }

    const cameraPos = this.getPos(CAMERA)
    if (!cameraPos) {
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



export interface IWorldPhysicsState {
  gravity: IVector2d,
  mediumDensity: number,
}

export class WorldPhysicsComponent extends Component<IWorldPhysicsState, Physics, IComponents> {
  static defaultState = {
    gravity: {x: 0, y: -9.81},
    mediumDensity: 1.2, // Air denisty is 1.2, water is 1000 or about
  }

  forces: Force[]

  addToWorldPartTwo = () => {
    this.forces = [ {
        type: ForceType.Acceleration,
        v: this.state.gravity,
      }, {
        type: ForceType.Medium,
        density: this.state.mediumDensity,
      }
    ]
  }

  removeFromWorldPartTwo = () => {
    this.forces = null
  }
}

{
 const _: IComponentClass<IWorldPhysicsState, Physics, IComponents, WorldPhysicsComponent> = WorldPhysicsComponent
}

export const worldPhysicsLens = (world: IWorld<any, IComponents>): LensFunction<WorldPhysicsComponent> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.worldPhysics
  })
}

export const worldPhysicsStateLens = (world: IWorld<any, IComponents>): LensFunction<IWorldPhysicsState> => {
  return world.lens((actor: IActor<IComponents>) => {
    return actor.components.worldPhysics.state
  })
}




export interface IComponentsState {

boxCollider?: IBoxColliderState

follow?: IFollowState

movement?: IMovementState

net?: INetState

objectPhysics?: IObjectProperties

position?: IPositionState

screen?: IScreenAttributesState

sprite?: ISpriteState

worldPhysics?: IWorldPhysicsState

}

export interface IComponents {

boxCollider?: BoxColliderComponent

follow?: FollowComponent

movement?: MovementComponent

net?: NetworkedComponent

objectPhysics?: ObjectPhysicsComponent

position?: PositionComponent

screen?: ScreenAttributesComponent

sprite?: SpriteComponent

worldPhysics?: WorldPhysicsComponent

}

const componentClasses = {

boxCollider: BoxColliderComponent,

follow: FollowComponent,

movement: MovementComponent,

net: NetworkedComponent,

objectPhysics: ObjectPhysicsComponent,

position: PositionComponent,

screen: ScreenAttributesComponent,

sprite: SpriteComponent,

worldPhysics: WorldPhysicsComponent,

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
export const makeWorld = (physics: Physics): World<Physics, IComponents> => {
  return new World<Physics, IComponents>(physics, factory)
}


