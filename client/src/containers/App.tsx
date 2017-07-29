import * as React from 'react'
import Canvas from "./Canvas";

interface IAppState {
  zoomLevel: number
}

export default class App extends React.Component<any, IAppState> {
    constructor(props) {
        super(props);
      
        //store our zoom level in state
        this.state = {
            zoomLevel:1.0
        }
        
        //pre bind our zoom handlers
        this.onZoomIn = this.onZoomIn.bind(this);
        this.onZoomOut = this.onZoomOut.bind(this);
    }
    /**    
     * Event handler for clicking zoom in. Increments the zoom level 
     **/
    onZoomIn() {
        let zoomLevel = this.state.zoomLevel + .1
        this.setState({zoomLevel});
    }
    /**    
     * Event handler for clicking zoom out. Decrements the zoom level 
     **/
    onZoomOut() {
        let zoomLevel = this.state.zoomLevel - .1
        
        if (zoomLevel >= 0) {
            this.setState({zoomLevel});
        }
        
    }
        
    render() {
         return (
             <div>
                <button onClick={this.onZoomIn}>Zoom In</button>
                <button onClick={this.onZoomOut}>Zoom Out</button>
                <Canvas zoomLevel={this.state.zoomLevel}/>
             </div>
         );
    }
}
