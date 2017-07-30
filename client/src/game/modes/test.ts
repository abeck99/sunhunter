import { GameMode } from '../core/modes'
import { Keys } from '../core/interactions'
import { PlayerActor } from '../actors/Player'
import { IComponents } from '../defs'

export class TestMode extends GameMode<IComponents> {
  playerId?: string

  start = () => {
    this.playerId = this.world.spawn(PlayerActor, {drag: {x:10, y:10}}).uuid

    this.watchKey(Keys.W, {pressed: () => {
      this.world.getActor(this.playerId).components.velocity.applyForce(0, -30)
    }})

    this.watchKey(Keys.S, {pressed: () => {
      this.world.getActor(this.playerId).components.velocity.applyForce(0, 30)
    }})

    this.watchKey(Keys.A, {pressed: () => {
      this.world.getActor(this.playerId).components.velocity.applyForce(-30, 0)
    }})

    this.watchKey(Keys.D, {pressed: () => {
      this.world.getActor(this.playerId).components.velocity.applyForce(30, 0)
    }})
  }

  tick = (elapsedTime: number) => {

  }
  
  stop = () => {
    this.world.removeActorFromWorld(this.world.getActor(this.playerId))
  }
}