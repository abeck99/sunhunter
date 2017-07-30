import { GameEffector } from '../core/effectors'

class GenerativeWorldEffector<TPhysics, TComponents> extends GameEffector<TPhysics, TComponents> {
  

  start = (shouldLoadContent: boolean) => {

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