import { IWorld } from './types'
import { KeyboardWatcher, IKeyboardCallbacks } from './interactions'
import * as id from 'shortid'

export class GameEffector<TConfig, TPhysics, TComponents> {
  world: IWorld<TPhysics, TComponents>
  effectorId: string
  config: TConfig

  keyboardWatchers: KeyboardWatcher[]

  constructor(world: IWorld<TPhysics, TComponents>, config: TConfig) {
    this.effectorId = id.generate()
    this.world = world
    this.keyboardWatchers = []
    this.config = config
  }

  watchKey = (keyCode: number, callbacks: IKeyboardCallbacks) => {
    const watcher = new KeyboardWatcher(keyCode, callbacks)
    this.keyboardWatchers.push(watcher)
  }

  // Override these
  start = (shouldLoadContent: boolean) => {

  }

  tick = (elapsedTime: number) => {

  }
  
  stop = () => {

  }

  getState = (): {[key: string]: any} => {
    return {}
  }

  setState = (data: {[key: string]: any}) => {

  }

  // Don't override these
  cleanup = () => {
    for (const watcher of this.keyboardWatchers) {
      watcher.remove()
    }
  }
}