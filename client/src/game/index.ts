import * as PIXI from "pixi.js"
//import { insideBackground } from './util/colors'


export class Game {
  private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  private world: PIXI.Container
  private frame?: number

  constructor() {
    this.renderer = PIXI.autoDetectRenderer(1366, 768);
    this.renderer.view.style.border = "1px dashed black"
    this.renderer.view.style.margin = "0 auto";
    this.renderer.view.style.display = "block";
    this.renderer.autoResize = true;
    this.renderer.resize(window.innerWidth-50, window.innerHeight-50);
    //this.renderer.backgroundColor = insideBackground

    // create the root of the scene graph
    this.world = new PIXI.Container();
  }

  getView = (): HTMLElement => {
    return this.renderer.view
  }

  start = () => {
    PIXI.loader
      .add("assets/test/char.png")
      .load(this.init)
  }

  init = () => {
    var sprite = new PIXI.Sprite(
      PIXI.loader.resources["assets/test/char.png"].texture
    );

    this.world.addChild(sprite)
    this.tick()
  }

  tick = () => {
    this.renderer.render(this.world);
    this.frame = requestAnimationFrame(this.tick);
  }
}
