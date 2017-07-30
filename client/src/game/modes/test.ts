import { GameMode } from '../core/modes'
import { Keys } from '../core/interactions'
import { PlayerActor } from '../actors/Player'
import { IComponents, velocityLens } from '../defs'

export class TestMode extends GameMode<IComponents> {
  playerId?: string

  start = (shouldLoadContent: boolean) => {
    if (shouldLoadContent) {
      this.playerId = this.world.spawn(PlayerActor, {drag: {x:10, y:10}}).uuid
    }

    const velocity = velocityLens(this.world)
    this.watchKey(Keys.W, {pressed: () => {
      console.log('b')
      velocity(this.playerId).applyForce(0,-30)
    }})

    this.watchKey(Keys.S, {pressed: () => {
      velocity(this.playerId).applyForce(0, 30)
    }})

    this.watchKey(Keys.A, {pressed: () => {
      velocity(this.playerId).applyForce(-30, 0)
    }})

    this.watchKey(Keys.D, {pressed: () => {
      velocity(this.playerId).applyForce(30, 0)
    }})
  }

  tick = (elapsedTime: number) => {

  }
  
  stop = () => {
    this.world.removeActorFromWorld(this.world.getActor(this.playerId))
  }

  getState = (): {[key: string]: any} => {
    return {
      playerId: this.playerId,
    }
  }

  setState = (data: {[key: string]: any}) => {
    this.playerId = data.playerId
  }
}