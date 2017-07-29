import * as PIXI from "pixi.js"
//import { insideBackground } from './util/colors'
import { PlayerActor } from './actors/Player'
import { IWorld } from './core/types'
import { IComponents, makeWorld } from './defs'

export class Game {
  private world: IWorld<IComponents>

  playerId: string

  constructor() {
    this.world = makeWorld({
      updateTick: this.tick,
    })

    this.playerId = this.world.spawn(PlayerActor, {}).uuid
  }

  getView = (): HTMLElement => {
    return this.world.getView()
  }

  start = () => {

  }

  tick = () => {
  }
}
