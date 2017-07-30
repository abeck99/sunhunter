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
import { SCREEN } from './util'
import { GameEffector } from './core/effectors'



import { TestEffector } from './effectors/test'
import { CameraEffector } from './effectors/camera'
import { GenerativeWorldEffector } from './effectors/generativeWorld'


export class Game {
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  private frame?: number

  private world: IWorld<Physics, IComponents>

  private effectors: GameEffector<Physics, IComponents>[]

  reloadWatcher: KeyboardWatcher
  meter: any

  constructor() {
    this.meter = new (window as any).FPSMeter()
    this.effectors = []
    this.renderer = PIXI.autoDetectRenderer(1366, 768, {
      backgroundColor: insideBackground.medium,
    });
    this.renderer.view.style.border = "1px dashed black"
    this.renderer.view.style.margin = "0 auto";
    this.renderer.view.style.display = "block";
    this.renderer.autoResize = true;
    this.renderer.resize(window.innerWidth-50, window.innerHeight-50);

    this.world = makeWorld()
    this.addEffector(new TestEffector(this.world))
    this.addEffector(new CameraEffector(this.world))

    this.world.spawnWithId(SCREEN, BlankActor, {
      screen: {
        w: this.renderer.width,
        h: this.renderer.height,
      }
    })

    //if (module.hot) {
    //  console.log('hot reloading is enabled+!')
    //  this.reloadWatcher = new KeyboardWatcher(Keys.R, {
    //    pressed: () => {
    //      const savedWorld = this.world.serialize()
    //      const modeState = this.mode.getState()
    //      this.world = require(`${server}app`).makeWorld()
    //      this.world.deserialize(savedWorld, false, BlankActor)
    //      this.mode.cleanup()
    //      this.mode = new TestMode(this.world)
    //      this.mode.setState(modeState)
    //      this.mode.start(false)
    //      console.log('Finished hot reload xz!')
    //    }
    //  })
    //}

    this.tick()
  }

  addEffector = (effector: GameEffector<Physics, IComponents>) => {
    this.effectors.push(effector)
    effector.start(true)
  }

  removeEffector = (effector: GameEffector<Physics, IComponents>) => {
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
    const fakeTimeElaspsed = 0.1
    for (const effector of this.effectors) {
      effector.tick(fakeTimeElaspsed)
    }
    this.world.tick(fakeTimeElaspsed)
    this.renderer.render(this.world.container)
    this.frame = requestAnimationFrame(this.tick)
    this.meter.tick()
  }
}
