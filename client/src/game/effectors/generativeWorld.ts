import { GameEffector } from '../core/effectors'

export class GenerativeWorldEffector<TPhysics, TComponents> extends GameEffector<TPhysics, TComponents> {
  start = (shouldLoadContent: boolean) => {
    if (shouldLoadContent) {
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