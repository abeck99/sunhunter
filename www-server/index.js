const path = require('path')
const fs = require('fs')
const express = require('express')
const morgan = require('morgan')


var app = express()

app.use(morgan('tiny'))

const assetsDir = '../client/www'
const listenPort = "1337"
const listenAddress = "0.0.0.0"
const useSsl = false

app.get('*', (req, res) => {
  const requestedRoute = req.params[0]
  const route = requestedRoute.endsWith('/') ? requestedRoute + 'index.html' : requestedRoute
  const filepath = path.join(__dirname, assetsDir, route)

  fs.stat(filepath, err => {
    if (err == null) {
      res.sendFile(filepath)
    } else {
      res.status(404).send()
    }
  })
})

app.listen(listenPort, listenAddress, err => {
  if (err) {
    console.log('Error starting admin-pages hosting')
    console.error(err)
  } else {
    console.log(`Listening at ${useSsl ? 'https' : 'http'}://${listenAddress}:${listenPort}/`)
  }
})


