import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor } from '../defs'

export class CameraActor extends Actor {
  static defaults: IComponentsState = {
    position: {},
  }
}

const _: IActorClass<IComponentsState, IComponents, CameraActor> = CameraActor