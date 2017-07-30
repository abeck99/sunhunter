import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor } from '../defs'

export class BlankActor extends Actor {
}

const _: IActorClass<IComponentsState, IComponents, BlankActor> = BlankActor