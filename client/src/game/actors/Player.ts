import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor } from '../defs'

export class PlayerActor extends Actor {
  static defaults: IComponentsState = {
    sprite: {
      asset: {
        url: "assets/test/char.png"
      }
    },
    position: {},
    velocity: {},
    boxCollider: {
      w: 16,
      h: 32,
      isStatic: false,
    },
  }
}

const _: IActorClass<IComponentsState, IComponents, PlayerActor> = PlayerActor