import * as PIXI from "pixi.js"
import * as jquery from 'jquery'
import * as R from 'ramda'
import 'fpsmeter'
import { IWorld } from './core/types'
import { IComponents, makeWorld } from './defs'
import { insideBackground } from './util/colors'
import { Keys, KeyboardWatcher } from './core/interactions'
import { BlankActor } from './actors/Blank'
import { Physics } from './physics'
import { GameEffector } from './core/effectors'
import { WorldPhysicsComponent } from './defs'


import { TestEffector } from './effectors/test'
import { CameraEffector } from './effectors/camera'
import { GenerativeWorldEffector } from './effectors/generativeWorld'


export class Game {
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  private frame?: number

  private physics: Physics
  private world: IWorld<Physics, IComponents>

  private effectors: GameEffector<any, Physics, IComponents>[]

  reloadWatcher: KeyboardWatcher
  meter: any

  constructor() {
    this.meter = new (window as any).FPSMeter()
    this.effectors = []
    this.renderer = PIXI.autoDetectRenderer(1366, 768, {
      backgroundColor: insideBackground.medium,
    })
    this.renderer.view.style.border = "1px dashed black"
    this.renderer.view.style.margin = "0 auto"
    this.renderer.view.style.display = "block"
    this.renderer.autoResize = true
    this.renderer.resize(window.innerWidth-50, window.innerHeight-50)

    this.physics = new Physics(50*5)

    this.world = makeWorld(this.physics)
    this.world.root = this.world.spawnWithId('root', BlankActor, {
      screen: {
        w: this.renderer.width,
        h: this.renderer.height,
      },
      worldPhysics: WorldPhysicsComponent.defaultState,

    })

    const testEffector = this.addEffector(new TestEffector(this.world, {}))
    const cameraEffector = this.addEffector(new CameraEffector(this.world, {
      followActor: testEffector.playerId,
    }))
    const generativeWorldEffector = this.addEffector(new GenerativeWorldEffector(this.world, {
      gridSize: 50,
      blockLoadSize: 4,
      blockLoadDistance: 4,
      followActor: 'camera',
    }));

    (window as any).test = testEffector;
    (window as any).camera = cameraEffector;
    (window as any).worldGen = generativeWorldEffector;
    (window as any).world = this.world;
    (window as any).physics = this.physics;

    this.tick()
  }

  addEffector = <TEffector extends GameEffector<any, Physics, IComponents>>(effector: TEffector): TEffector => {
    this.effectors.push(effector)
    effector.start(true)
    return effector
  }

  removeEffector = (effector: GameEffector<any, Physics, IComponents>) => {
    this.effectors = R.filter((e) => {
      return e.effectorId != effector.effectorId
    }, this.effectors)
    effector.stop()
    effector.cleanup()
  }

  getView = (): HTMLElement => {
    return this.renderer.view
  }

  start = () => {

  }

  tick = () => {
    this.meter.tickStart()
    const fakeTimeElaspsed = (window as any).t || 0.00000001
    for (const effector of this.effectors) {
      effector.tick(fakeTimeElaspsed)
    }
    this.world.tick(fakeTimeElaspsed)
    this.renderer.render(this.world.container)
    this.frame = requestAnimationFrame(this.tick)
    this.meter.tick()
  }
}
