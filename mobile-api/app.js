const express = require('express')
const bodyParser = require('body-parser')
let jwt = require('jsonwebtoken')
let config = require('./secret')
let middleware = require('./middleware')

const userName = 'veselov'
const channelMQ = userName.toUpperCase() + '_TRADE'
const rabbitmq = new (require('solid-communication-foundation'))(null, channelMQ, require('solid-logger')('scf', 'trade:rabbitmq'))
const logger = require('solid-logger')('intapi')

rabbitmq.start()

class HandlerGenerator {
  login (req, res) {
    let username = req.body.username
    let password = req.body.password
    let mockedUsername = 'admin'
    let mockedPassword = 'password'

    if (username && password) {
      if (username === mockedUsername && password === mockedPassword) {
        let token = jwt.sign({
          username: username
        },
        config.secret,
        {
          expiresIn: '60000'
        })
        res.json({
          success: true,
          message: 'Auth successful',
          token
        })
      } else {
        res.status(403).json({
          success: false,
          message: 'Incorrect username or password'
        })
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Authorization failed. No Username or password found'
      })
    }
  }

  index(req, res) {
    res.json({
      success: true,
      message: 'Index page'
    })
  }
}

function main () {
  let app = express()
  let handlers = new HandlerGenerator()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.post('/login', handlers.login)
  app.get('/', middleware.checkToken, handlers.index)
  app.listen('3030', () => {
    console.log('Server started on port 3030')
  })
}

main()