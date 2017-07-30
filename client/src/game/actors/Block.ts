import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor } from '../defs'

export class BlockActor extends Actor {
  static defaults: IComponentsState = {
    sprite: {
      asset: {
        url: "assets/test/block.png"
      }
    },
    position: {},
  }
}

const _: IActorClass<IComponentsState, IComponents, BlockActor> = BlockActor