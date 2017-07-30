import { IWorld } from './types'
import { KeyboardWatcher, IKeyboardCallbacks } from './interactions'

export class GameMode<TComponents> {
  world: IWorld<TComponents>

  keyboardWatchers: KeyboardWatcher[]

  constructor(world: IWorld<TComponents>) {
    this.world = world
    this.keyboardWatchers = []
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