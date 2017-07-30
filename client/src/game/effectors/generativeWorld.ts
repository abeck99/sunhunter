import { GameEffector } from '../core/effectors'
import { IVector2d } from '../util/math'
import { IPositionState, positionStateLens } from '../defs'
import { LensFunction } from '../core/types'
import { CAMERA } from '../util'

export class GenerativeWorldEffector<TPhysics, TComponents> extends GameEffector<{}, TPhysics, TComponents> {
  getPos: LensFunction<IPositionState>

  start = (shouldLoadContent: boolean) => {
    this.getPos = positionStateLens(this.world)
    if (shouldLoadContent) {
      this.determineNeededSquares()
    }

  }

  determineNeededSquares = () => {
    const cameraPos = this.getPos(CAMERA)
    if (!cameraPos) {
      return
    }

    const gridPoint = this.translatePosToGridPoints({x:cameraPos.x, y:cameraPos.y})


  }

  translatePosToGridPoints = (pos: IVector2d): IVector2d => {
    return {x:0,y:0}

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