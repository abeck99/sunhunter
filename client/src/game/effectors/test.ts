import { GameEffector } from '../core/effectors'
import { Keys } from '../core/interactions'
import { PlayerActor } from '../actors/Player'
import { IComponents, velocityLens } from '../defs'

export class TestEffector<TPhysics> extends GameEffector<{}, TPhysics, IComponents> {
  playerId?: string

  start = (shouldLoadContent: boolean) => {
    if (shouldLoadContent) {
      console.log('hi')
      this.playerId = this.world.spawn(PlayerActor, {
        position: {y: 16},
        drag: {a:10},
      }).uuid
    }

    const velocity = velocityLens(this.world)
    this.watchKey(Keys.W, {pressed: () => {
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