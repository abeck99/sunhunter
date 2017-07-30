import { IComponentClass, IAsset } from './core/types'

export class Component<TComponentConfig, TComponents> implements IComponent<TComponentConfig, TComponents> {
  actor: IActor<TComponents>

  constructor(actor: IActor<TComponents>, config: TComponentConfig) {
    this.actor = actor
    this.init(config)
  }

  init = (config: TComponentConfig) => {}
  addToWorld = (world: IWorld<TComponents>) => {}
  removeFromWorld = (world: IWorld<TComponents>) => {}
  tick = (elapsedTime: number) => {}
}




export interface ISpriteConfig {
  asset: IAsset
}

export class SpriteComponent extends Component<ISpriteConfig, IComponents> {

  static assetsToLoad = (config: ISpriteConfig): IAsset[] => {
    return [
      config.asset
    ]
  }

  addToWorld = (world: IWorld<IComponents>) => {
    console.log('ere i am')
    console.log('hi')
  }

  removeFromWorld = (world: IWorld<IComponents>) => {
    
  }

  tick = (timeElapsed: number) => {

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


