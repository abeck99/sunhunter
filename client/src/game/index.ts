import * as PIXI from "pixi.js"
import { IWorld } from './core/types'
import { IComponents, makeWorld } from './defs'
import { insideBackground } from './util/colors'
import { GameMode } from './core/modes'
import { TestMode } from './modes/test'


export class Game {
  private world: IWorld<IComponents>

  mode?: GameMode<IComponents>

  constructor() {
    this.world = makeWorld({
      updateTick: this.tick,
      renderOptions: {
        backgroundColor: insideBackground.medium,
      }
    })

    this.setMode(new TestMode(this.world))
  }

  setMode = (mode: GameMode<IComponents>) => {
    if (this.mode) {
      this.mode.stop()
      this.mode.cleanup()
    }

    this.mode = mode

    if (this.mode) {
      this.mode.start()
    }
  }

  getView = (): HTMLElement => {
    return this.world.getView()
  }

  start = () => {

  }

  tick = () => {
  }
}
