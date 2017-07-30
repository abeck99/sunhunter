import { IComponentClass, IAsset } from './core/types'
import * as PIXI from "pixi.js"


export class Component<TComponentConfig, TComponents> implements IComponent<TComponentConfig, TComponents> {
  actor: IActor<TComponents>
  world?: IWorld<TComponents>
  config?: TComponentConfig
  didCallHasWorldAndConfig: boolean

  constructor(actor: IActor<TComponents>, config: TComponentConfig) {
    this.actor = actor
    this.didCallHasWorldAndConfig = false
    this.init(config)
  }

  hasWorldAndConfig_ = () => {

  }
  hasWorldAndConfig = () => {
    this.hasWorldAndConfig_()
  }

  checkIfHasWorldAndConfig = () => {
    if (!this.didCallHasWorldAndConfig && this.world && this.config) {
      this.didCallHasWorldAndConfig = true
      this.hasWorldAndConfig()
    }
  }

  init_ = (config: TComponentConfig) => {
    this.config = config
    this.checkIfHasWorldAndConfig()
  }
  init = (config: TComponentConfig) => {
    this.init_(config)
  }

  addToWorld_ = (world: IWorld<TComponents>) => {
    this.world = world
    this.checkIfHasWorldAndConfig()
  }
  addToWorld = (world: IWorld<TComponents>) => {
    this.addToWorld_(world)
  }

  removeFromWorld_ = (world: IWorld<TComponents>) => {
    this.world = null
  }
  removeFromWorld = (world: IWorld<TComponents>) => {
    this.removeFromWorld_(world)
  }

  tick_ = (elapsedTime: number) => {}
  tick = (elapsedTime: number) => {
    this.tick_(elapsedTime)
  }
}




export interface ISpriteConfig {
  asset: IAsset
}

export class SpriteComponent extends Component<ISpriteConfig, IComponents> {
  sprite?: PIXI.Sprite

  static assetsToLoad = (config: ISpriteConfig): IAsset[] => {
    return [
      config.asset
    ]
  }

  hasWorldAndConfig = () => {
    this.hasWorldAndConfig_()
    this.sprite = new PIXI.Sprite(this.world.getTexture(this.config.asset))
    this.world.container.addChild(this.sprite)
  }

  init = (config: ISpriteConfig) => {
    this.init_(config)
  }

  addToWorld = (world: IWorld<IComponents>) => {
    this.addToWorld_(world)
  }

  removeFromWorld = (world: IWorld<IComponents>) => {
    this.removeFromWorld_(world)
  }

  tick = (timeElapsed: number) => {
    this.tick_(timeElapsed)
  }
}

const _: IComponentClass<ISpriteConfig, IComponents, SpriteComponent> = SpriteComponent





// Component definitions
// import { ISpriteConfig, SpriteComponent } from './components/sprite'

export interface IConfig {

sprite?: ISpriteConfig

}

export interface IComponents {

sprite?: SpriteComponent

}

const componentClasses = {

sprite: SpriteComponent,

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


