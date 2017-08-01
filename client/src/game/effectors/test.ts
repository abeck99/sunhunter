import { GameEffector } from '../core/effectors'
import { Keys } from '../core/interactions'
import { PlayerActor } from '../actors/Player'
import { IComponents, movementLens } from '../defs'

const forceAmount = 1

const upForce = {x:0, y:forceAmount}
const downForce = {x:0, y:-1*forceAmount}
const leftForce = {x:-1*forceAmount, y:0}
const rightForce = {x:forceAmount, y:0}

export class TestEffector<TPhysics> extends GameEffector<{}, TPhysics, IComponents> {
  playerId?: string

  start = (shouldLoadContent: boolean) => {
    if (shouldLoadContent) {
      console.log('hi')
      this.playerId = this.world.spawn(PlayerActor, {
        position: {x: 0, y: 16},
      }).uuid
    }

    const movement = movementLens(this.world)
    this.watchKey(Keys.W, {
      pressed: () => {
        movement(this.playerId).applyForce(upForce)
      },
      released: () => {
        movement(this.playerId).applyForce(downForce)
      }})

    this.watchKey(Keys.S, {pressed: () => {
        movement(this.playerId).applyForce(downForce)
      },
      released: () => {
        movement(this.playerId).applyForce(upForce)
      }})

    this.watchKey(Keys.A, {pressed: () => {
        movement(this.playerId).applyForce(leftForce)
      },
      released: () => {
        movement(this.playerId).applyForce(rightForce)
      }})

    this.watchKey(Keys.D, {pressed: () => {
        movement(this.playerId).applyForce(rightForce)
      },
      released: () => {
        movement(this.playerId).applyForce(leftForce)
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