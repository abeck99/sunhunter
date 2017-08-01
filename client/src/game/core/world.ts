import * as PIXI from "pixi.js"
import * as id from 'shortid'
import * as Promise from 'bluebird'
import * as R from 'ramda'
import { IActorClass, IActor, IActorState, IWorld, IComponent, IActorFactory, TickFunction, IAsset, LensFunction } from './types'
import { Actor } from '../defs'

export class World<TPhysics, TComponents> implements IWorld<TPhysics, TComponents> {
  container: PIXI.Container
  physics: TPhysics
  root: IActor<TComponents>

  private actors: {
    [key: string]: IActor<TComponents>
  }

  private factory: IActorFactory<TComponents>

  constructor(physics: TPhysics, factory: IActorFactory<TComponents>) {
    this.physics = physics
    this.container = new PIXI.Container()
    this.actors = {}
    this.factory = factory
  }

  tick = (elapsedTime: number) => {
    for (const actor of R.values(this.actors)) {
      for (const component of R.values(actor.components)) {
        component.tick(elapsedTime)
      }
    }
  }

  addActorToWorld = (actor: IActor<TComponents>) => {
    this.actors[actor.uuid] = actor
    R.mapObjIndexed((component, componentName) => {
      component.setWorld(this)
    }, actor.components)
  }

  removeActorFromWorld = (actor: IActor<TComponents>) => {
    const uuid = actor.uuid
    if (this.actors[uuid]) {
      delete this.actors[uuid]
    }

    R.mapObjIndexed((component, componentName) => {
      component.setWorld(undefined)
    }, actor.components)
  }

  removeActorFromWorldWithId = (uuid: string) => {
    const actor = this.getActor(uuid)
    if (actor) {
      this.removeActorFromWorld(actor)
    }
  }

  spawn = <TComponentsState>(cls: IActorClass<TComponentsState, TComponents, IActor<TComponents>>, state: TComponentsState): IActor<TComponents> => {
    const uuid = id.generate()
    return this.spawnWithId<TComponentsState>(uuid, cls, state)
  }

  spawnWithId = <TComponentsState>(uuid: string, cls: IActorClass<TComponentsState, TComponents, IActor<TComponents>>, state: TComponentsState): IActor<TComponents> => {
    const actor = this.factory.create(uuid, cls, state)
    this.addActorToWorld(actor)
    return actor
  }

  getTexture = (asset: IAsset): PIXI.Texture => {
    return PIXI.loader.resources[asset.url].texture
  }

  getActor = (uuid: string): IActor<TComponents> => {
    return this.actors[uuid]
  }

  lens = <T>(lensFunc: (actor: IActor<TComponents>) => T): LensFunction<T> => {
    return (uuid: string): T => {
      const actor = this.getActor(uuid)
      if (actor) {
        return lensFunc(actor)
      }

      return undefined
    }
  }

  serialize = (): string => {
    var actorStates = R.map(
      (actor): IActorState<any> => {
        return actor.getState()
      }, R.values(this.actors))
    return JSON.stringify({actorStates: actorStates})
  }

  // TODO: this strips Actor class, but for now that's not an issue since no subclasses do anything special
  deserialize = <TComponentsState>(serializedState: string, isCopy: boolean, cls: IActorClass<TComponentsState, TComponents, IActor<TComponents>>) => {
    const state = JSON.parse(serializedState)

    if (!state) {
      console.log('Could not load state')
      return
    }

    var actorStates: IActorState<TComponentsState>[] = state.actorStates

    if (!actorStates) {
      console.log('Could not load actor states')
      return
    }

    // If we're copying we need to remap actor uuids for any inner references
    if (isCopy) {
      // First create uuid map
      var uuidMap: {[key: string]: string} = {}
      for (const actorState of actorStates) {
        uuidMap[actorState.uuid] = id.generate()
      }

      var newActorStates: IActorState<TComponentsState>[] = []
      // Then search states to inject new uuids
      for (const actorState of actorStates) {
        var newActorState: TComponentsState = {} as TComponentsState
        R.mapObjIndexed((componentState, componentName) => {
          var newComponentState: {[key: string]: any} = {}
          R.mapObjIndexed((attribute, attributeName) => {
            if (attributeName.endsWith('Actor') && typeof attribute == 'string') {
              const newUuid = uuidMap[attribute]
              if (!newUuid) {
                console.log('External reference found... something bad could happen')
              } else {
                newComponentState[attributeName] = newUuid
              }
            } else {
              newComponentState[attributeName] = attribute
            }
          }, componentState)

          newActorState[componentName] = newComponentState
        }, actorState.state)

        newActorStates.push({
          uuid: uuidMap[actorState.uuid],
          state: newActorState
        })
      }

      actorStates = newActorStates
    }

    for (const actorState of actorStates) {
      const uuid = actorState.uuid
      const existingActor = this.actors[uuid]

      if (existingActor) {
        this.removeActorFromWorld(existingActor)
      }

      this.spawnWithId<TComponentsState>(uuid, cls, actorState.state)
    }
  }
}