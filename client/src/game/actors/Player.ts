import { IActorClass } from '../core/types'
import { IConfig, IComponents, Actor } from '../defs'

export class PlayerActor extends Actor {
  static defaults = {
    sprite: {
      asset: {
        url: "assets/test/char.png"
      }
    },
    position: {},
    velocity: {x:1},
  }
}

const _: IActorClass<IConfig, IComponents, PlayerActor> = PlayerActor