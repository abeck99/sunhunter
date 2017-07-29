import * as PIXI from "pixi.js"

export class Game {
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  private world: PIXI.Container
  private frame?: number

  constructor() {
    this.renderer = PIXI.autoDetectRenderer(1366, 768);
    this.renderer.view.style.border = "1px dashed black"

    // create the root of the scene graph
    this.world = new PIXI.Container();
    this.world.width = 1366;
    this.world.height = 768;
  }

  getView = (): HTMLElement => {
    return this.renderer.view
  }

  start = () => {
    this.tick()
  }

  tick = () => {
    this.renderer.render(this.world);
    this.frame = requestAnimationFrame(this.tick);
  }
}
