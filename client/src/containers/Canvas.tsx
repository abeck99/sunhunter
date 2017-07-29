import * as React from 'react'
import * as PIXI from "pixi.js"

interface IState {

}

interface IProps {
  zoomLevel: number
}

export default class Canvas extends React.Component<IProps, IState> {
  refs: {
    gameCanvas: HTMLElement
  }

  renderer?: PIXI.WebGLRenderer | PIXI.CanvasRenderer
  stage?: PIXI.Container
  frame?: number

        constructor( props ) { 
            super(props)
            //bind our animate function
            this.animate = this.animate.bind(this);
            //bind our zoom function
            this.updateZoomLevel = this.updateZoomLevel.bind(this);
        }
        
        /**
        * In this case, componentDidMount is used to grab the canvas container ref, and 
        * and hook up the PixiJS renderer
        **/
        componentDidMount() {
           //Setup PIXI Canvas in componentDidMount
           this.renderer = PIXI.autoDetectRenderer(1366, 768);
           this.refs.gameCanvas.appendChild(this.renderer.view);
           
           // create the root of the scene graph
           this.stage = new PIXI.Container();
           this.stage.width = 1366;
           this.stage.height = 768;
           
           //start the game
           this.animate();
        }
        /**
        * shouldComponentUpdate is used to check our new props against the current
        * and only update if needed
        **/
        shouldComponentUpdate(nextProps, nextState) {
            //this is easy with 1 prop, using Immutable helpers make 
            //this easier to scale
            
            return nextProps.zoomLevel !== this.props.zoomLevel;
        }
        /**
        * When we get new props, run the appropriate imperative functions 
        **/
        componentWillReceiveProps(nextProps) {
            this.updateZoomLevel(nextProps);
        }
        
        /**
        * Update the stage "zoom" level by setting the scale
        **/
        updateZoomLevel(props) {
            this.stage.scale.x = props.zoomLevel;
            this.stage.scale.y = props.zoomLevel;
        }
        
        /**
        * Animation loop for updating Pixi Canvas
        **/
        animate() {
            // render the stage container
            this.renderer.render(this.stage);
            this.frame = requestAnimationFrame(this.animate);
        }
        
        /**
        * Render our container that will store our PixiJS game canvas. Store the ref
        **/
        render() {
            return (
                    <div className="game-canvas-container" ref="gameCanvas">              
                    </div>
            );
        }
}
