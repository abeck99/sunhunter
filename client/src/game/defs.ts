import { IComponentClass, IAsset } from './core/types'
import * as PIXI from "pixi.js"


export class Component<TComponentConfig, TComponents> implements IComponent<TComponentConfig, TComponents> {
  actor: IActor<TComponents>
  world?: IWorld<TComponents>
  config: TComponentConfig

  constructor(actor: IActor<TComponents>, config: TComponentConfig) {
    this.actor = actor
    this.loaded = false
    this.wasAddedToWorld = false
    this.config = config
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
}




export interface IPositionConfig {
  x?: number,
  y?: number
}

export class PositionComponent extends Component<IPositionConfig, IComponents> {
  static configDefaults = {
    x: 0,
    y: 0,
  }

  x: number
  y: number

  addToWorldPartTwo = () => {
    this.x = this.config.x
    this.y = this.config.y
  }

  tick = (timeElapsed: number) => {
  }
}

{
 const _: IComponentClass<IPositionConfig, IComponents, PositionComponent> = PositionComponent
}


export interface ISpriteConfig {
  asset: IAsset
}

export class SpriteComponent extends Component<ISpriteConfig, IComponents> {
  static configDefaults = {
    asset: {
      url: 'none'
    }
  }

  sprite?: PIXI.Sprite

  static assetsToLoad = (config: ISpriteConfig): IAsset[] => {
    return [
      config.asset
    ]
  }

  addToWorldPartTwo = () => {
    this.sprite = new PIXI.Sprite(this.world.getTexture(this.config.asset))
    this.world.container.addChild(this.sprite)
  }

  tick = (timeElapsed: number) => {
    if (this.sprite && this.actor.components.position) {
      this.sprite.x = this.actor.components.position.x
      this.sprite.y = this.actor.components.position.y
      console.log(this.sprite.x)
    }
  }
}

{
 const _: IComponentClass<ISpriteConfig, IComponents, SpriteComponent> = SpriteComponent
}


export interface IVelocityComponent {
  x?: number,
  y?: number
}

export class VelocityComponent extends Component<IVelocityComponent, IComponents> {
  static configDefaults = {
    x: 0,
    y: 0,
  }

  x: number
  y: number

  addToWorldPartTwo = () => {
    this.x = this.config.x
    this.y = this.config.y
  }

  tick = (timeElapsed: number) => {
    console.log(`velocity: ${this.x}`)
    this.actor.components.position.x += this.x*timeElapsed
    this.actor.components.position.y += this.y*timeElapsed
  }
}

{
 const _: IComponentClass<IVelocityComponent, IComponents, VelocityComponent> = VelocityComponent
}



export interface IConfig {

position?: IPositionConfig

sprite?: ISpriteConfig

velocity?: IVelocityComponent

}

export interface IComponents {

position?: PositionComponent

sprite?: SpriteComponent

velocity?: VelocityComponent

}

const componentClasses = {

position: PositionComponent,

sprite: SpriteComponent,

velocity: VelocityComponent,

}



// Concrete classes using definitions
import { ActorFactory } from './core/actors'
import { World, IWorldConfig } from './core/world'
import { IActor, IWorld, IComponent } from './core/types'

export class Actor implements IActor<IComponents> {
  uuid: string
  components: IComponents

  static defaults: {}

  constructor(uuid: string) {
    this.uuid = uuid
    this.components = {}
  }
}

export const factory = new ActorFactory<IComponents>(componentClasses)
export const makeWorld = (worldConfig: IWorldConfig): World<IComponents> => {
  return new World<IComponents>(worldConfig, factory)
}


