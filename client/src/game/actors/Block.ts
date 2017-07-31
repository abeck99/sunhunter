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
    boxCollider: {
      w: 50,
      h: 50,
      isStatic: true,
    }
  }
}

const _: IActorClass<IComponentsState, IComponents, BlockActor> = BlockActor