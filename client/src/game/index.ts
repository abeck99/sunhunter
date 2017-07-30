import * as PIXI from "pixi.js"
import * as jquery from 'jquery'
import { IWorld } from './core/types'
import { IComponents, makeWorld } from './defs'
import { insideBackground } from './util/colors'
import { GameMode } from './core/modes'
import { TestMode } from './modes/test'
import { Keys, KeyboardWatcher } from './core/interactions'
import { NetworkedActor } from './actors/Networked'
import "webpack-runtime-require"

export var server = 'http://localhost:1337/scripts/'

export class Game {
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  private frame?: number

  private world: IWorld<IComponents>
  private mode?: GameMode<IComponents>

  reloadWatcher: KeyboardWatcher

  constructor() {
    this.renderer = PIXI.autoDetectRenderer(1366, 768, {
      backgroundColor: insideBackground.medium,
    });
    this.renderer.view.style.border = "1px dashed black"
    this.renderer.view.style.margin = "0 auto";
    this.renderer.view.style.display = "block";
    this.renderer.autoResize = true;
    this.renderer.resize(window.innerWidth-50, window.innerHeight-50);

    this.world = makeWorld()
    this.setMode(new TestMode(this.world))

    if (module.hot) {
      console.log('hot reloading is enabled+!')
      this.reloadWatcher = new KeyboardWatcher(Keys.R, {
        pressed: () => {
          const savedWorld = this.world.serialize()
          const modeState = this.mode.getState()
          this.world = require(`${server}app`).makeWorld()
          this.world.deserialize(savedWorld, false, NetworkedActor)
          this.mode.cleanup()
          this.mode = new TestMode(this.world)
          this.mode.setState(modeState)
          this.mode.start(false)
          console.log('Finished hot reload xz!')
        }
      })
    }


    this.tick()
  }

  setMode = (mode: GameMode<IComponents>) => {
    if (this.mode) {
      this.mode.stop()
      this.mode.cleanup()
    }

    this.mode = mode

    if (this.mode) {
      this.mode.start(true)
    }
  }

  getView = (): HTMLElement => {
    return this.renderer.view
  }

  start = () => {

  }

  tick = () => {
    const fakeTimeElaspsed = 0.1
    if (this.mode) {
      this.mode.tick(fakeTimeElaspsed)
    }
    this.world.tick(fakeTimeElaspsed)
    this.renderer.render(this.world.container)
    this.frame = requestAnimationFrame(this.tick)
  }
}
