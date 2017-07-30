import * as PIXI from "pixi.js"
import * as id from 'shortid'
import * as Promise from 'bluebird'
import * as R from 'ramda'
import { IActorClass, IActor, IActorState, IWorld, IComponent, IActorFactory, TickFunction, IAsset } from './types'
import { Actor } from '../defs'

export interface IWorldConfig {
  updateTick: TickFunction
  renderOptions: PIXI.RendererOptions
}

export class World<TComponents> implements IWorld<TComponents> {
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  container: PIXI.Container
  private frame?: number

  private actors: {
    [key: string]: IActor<TComponents>
  }

  private config: IWorldConfig
  private factory: IActorFactory<TComponents>

  constructor(config: IWorldConfig, factory: IActorFactory<TComponents>) {
    this.config = config

    this.renderer = PIXI.autoDetectRenderer(1366, 768, config.renderOptions);
    this.renderer.view.style.border = "1px dashed black"
    this.renderer.view.style.margin = "0 auto";
    this.renderer.view.style.display = "block";
    this.renderer.autoResize = true;
    this.renderer.resize(window.innerWidth-50, window.innerHeight-50);

    this.container = new PIXI.Container()
    this.actors = {}

    this.factory = factory

    this.render()
  }

  getView = (): HTMLElement => {
    return this.renderer.view
  }

  render = () => {
    const fakeTimeElaspsed = 0.1

    this.config.updateTick(fakeTimeElaspsed)
    for (const actor of R.values(this.actors)) {
      for (const component of R.values(actor.components)) {
        component.tick(fakeTimeElaspsed)
      }
    }
    this.renderer.render(this.container)
    this.frame = requestAnimationFrame(this.render)
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