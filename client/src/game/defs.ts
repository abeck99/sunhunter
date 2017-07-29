// Component definitions
import { ISpriteConfig, SpriteComponent } from './components/sprite'

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

export class Component<TComponentConfig> implements IComponent<TComponentConfig, IComponents> {
  actor: IActor<IComponents>

  constructor(actor: IActor<IComponents>, config: TComponentConfig) {
    this.actor = actor
    this.init(config)
  }

  init = (config: TComponentConfig) => {}
  addToWorld = (world: IWorld<IComponents>) => {}
  removeFromWorld = (world: IWorld<IComponents>) => {}
  tick = (elapsedTime: number) => {}
}

export const factory = new ActorFactory<IComponents>(componentClasses)
export const makeWorld = (worldConfig: IWorldConfig): World<IComponents> => {
  return new World<IComponents>(worldConfig, factory)
}