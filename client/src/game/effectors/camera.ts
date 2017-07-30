import { GameEffector } from '../core/effectors'
import { IComponents, positionLens } from '../defs'
import { CAMERA } from '../util'
import { CameraActor } from '../actors/Camera'

export class CameraEffector<TPhysics> extends GameEffector<{}, TPhysics, IComponents> {
  start = (shouldLoadContent: boolean) => {
    if (shouldLoadContent) {
      this.world.spawnWithId(CAMERA, CameraActor, {})
    }
  }

  tick = (elapsedTime: number) => {

  }
  
  stop = () => {
  }

  getState = (): {[key: string]: any} => {
    return {
    }
  }

  setState = (data: {[key: string]: any}) => {
  }
}