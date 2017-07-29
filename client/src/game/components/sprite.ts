import { Component, IComponents } from '../defs'
import { IComponentClass, IAsset, IWorld } from '../core/types'

export interface ISpriteConfig {
  asset: IAsset
}

export class SpriteComponent extends Component<ISpriteConfig> {

  static assetsToLoad = (config: ISpriteConfig): IAsset[] => {
    return [
      config.asset
    ]
  }

  addToWorld = (world: IWorld<IComponents>) => {
    
  }

  removeFromWorld = (world: IWorld<IComponents>) => {
    
  }

  tick = (timeElapsed: number) => {

  }
}

const _: IComponentClass<ISpriteConfig, IComponents, SpriteComponent> = SpriteComponent
