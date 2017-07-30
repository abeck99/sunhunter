export const Keys = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  R: 82,
  SPACEBAR: 32,
}

type Callback = () => void

export interface IKeyboardCallbacks {
  pressed?: Callback
  released?: Callback
}

export class KeyboardWatcher {
  keyCode: number
  isDown: boolean
  callbacks: IKeyboardCallbacks
  paused: boolean

  constructor(keyCode: number, callbacks: IKeyboardCallbacks) {
    this.keyCode = keyCode
    this.isDown = false
    this.callbacks = callbacks
    this.paused = false

    window.addEventListener(
      "keydown", this.downHandler, false
    )
    window.addEventListener(
      "keyup", this.upHandler, false
    )
  }

  remove = () => {
    /*
    if (this.isDown && !this.paused && this.callbacks.released) {
      this.callbacks.released()
    }
    */

    window.removeEventListener(
      "keydown", this.downHandler, false
    )
    window.removeEventListener(
      "keyup", this.upHandler, false
    )
  }

  downHandler = (event: any) => {
    if (event.keyCode == this.keyCode) {
      if (!this.isDown && !this.paused && this.callbacks.pressed) {
        this.callbacks.pressed()
      }
      this.isDown = true
    }
    event.preventDefault()
  }

  upHandler = (event: any) => {
    if (event.keyCode == this.keyCode) {
      if (this.isDown && !this.paused && this.callbacks.released) {
        this.callbacks.released()
      }
      this.isDown = false
    }
    event.preventDefault()
  }
}

