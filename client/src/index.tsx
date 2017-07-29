import * as React from 'react'
import * as reactDOM from 'react-dom'
import App from './containers/App'

interface HasDefault {
  default: any
}

const render = (Component) => {
  reactDOM.render(
    <Component />,
    document.getElementById('app')
  )
}

render(App)
