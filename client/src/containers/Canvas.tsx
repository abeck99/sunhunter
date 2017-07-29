import * as React from 'react'
import { Game } from '../game'

interface IState {
  game: Game
}

interface IProps {
  zoomLevel: number
}

export default class Canvas extends React.Component<IProps, IState> {
  refs: {
    gameCanvas: HTMLElement
  }

  constructor( props ) { 
    super(props)
    this.state = {
      game: new Game()
    }
    //this.game = new Game()
    this.updateZoomLevel = this.updateZoomLevel.bind(this);
  }
  
  componentDidMount() {
    this.refs.gameCanvas.appendChild(this.state.game.getView())
    this.state.game.start()
  }

  shouldComponentUpdate(nextProps, nextState) {
      //this is easy with 1 prop, using Immutable helpers make 
      //this easier to scale      
      return nextProps.zoomLevel !== this.props.zoomLevel;
  }

  componentWillReceiveProps(nextProps) {
      this.updateZoomLevel(nextProps);
  }
  
  /**
  * Update the stage "zoom" level by setting the scale
  **/
  updateZoomLevel(props) {
    // this.stage.scale.x = props.zoomLevel;
    // this.stage.scale.y = props.zoomLevel;
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
