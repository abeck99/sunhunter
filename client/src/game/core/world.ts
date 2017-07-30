import * as PIXI from "pixi.js"
import * as id from 'shortid'
import * as Promise from 'bluebird'
import * as R from 'ramda'
import { IActorClass, IActor, IWorld, IComponent, IActorFactory, TickFunction, ISpawnInfo } from './types'

export interface IWorldConfig {
  updateTick: TickFunction
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

    this.renderer = PIXI.autoDetectRenderer(1366, 768);
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
    this.frame = requestAnimationFrame(this.render);
  }

  addActorToWorld = (actor: IActor<TComponents>) => {
    R.mapObjIndexed((component, componentName) => {
      component.addToWorld(this)
    }, actor.components)
  }

  spawn = <TConfig, T extends IActor<TComponents>>(cls: IActorClass<TConfig, TComponents, T>, config: TConfig): ISpawnInfo<T> => {
    const uuid = id.generate()
    const promise = this.factory.create(uuid, cls, config)
      .then((actor) => {
        this.actors[uuid] = actor
        this.addActorToWorld(actor)
      })
    return { uuid, promise }
  }
}