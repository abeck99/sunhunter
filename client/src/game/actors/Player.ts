import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor, ObjectPhysicsComponent, MovementComponent } from '../defs'

export class PlayerActor extends Actor {
  static defaults: IComponentsState = {
    sprite: {
      asset: {
        url: "assets/test/char.png"
      }
    },
    position: {x:0, y:0},
    boxCollider: {
      w: 16,
      h: 32,
      isStatic: false,
    },
    objectPhysics: ObjectPhysicsComponent.defaultState,
    movement: MovementComponent.defaultState,
  }
}

const _: IActorClass<IComponentsState, IComponents, PlayerActor> = PlayerActor