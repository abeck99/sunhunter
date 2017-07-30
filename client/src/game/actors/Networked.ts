import { IActorClass } from '../core/types'
import { IComponentsState, IComponents, Actor } from '../defs'

export class NetworkedActor extends Actor {
}

const _: IActorClass<IComponentsState, IComponents, NetworkedActor> = NetworkedActor