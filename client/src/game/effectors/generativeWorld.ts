import { GameEffector } from '../core/effectors'
import { IVector2d } from '../util/math'
import { IPositionState } from '../defs'
import { LensFunction } from '../core/types'
import { CAMERA } from '../util'

export class GenerativeWorldEffector<TPhysics, TComponents> extends GameEffector<TPhysics, TComponents> {
  getPos: LensFunction<IPositionState>

  start = (shouldLoadContent: boolean) => {
    if (shouldLoadContent) {
    }

  }

  determineNeededSquares = () => {

  }

  translatePosToGridPoints = (pos: IVector2d) => {

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