import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor } from '../defs'

export class BlockActor extends Actor {
  static defaults: IComponentsState = {
    sprite: {
      asset: {
        url: "assets/test/block.png"
      }
    },
    position: {x:0, y:0},
    boxCollider: {
      w: 50,
      h: 50,
      isStatic: true,
    }
  }
}

const _: IActorClass<IComponentsState, IComponents, BlockActor> = BlockActor