import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor } from '../defs'

export class CameraActor extends Actor {
  static defaults: IComponentsState = {
    position: {x:0, y:0},
  }
}

const _: IActorClass<IComponentsState, IComponents, CameraActor> = CameraActor