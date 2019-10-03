const express = require('express')
const bodyParser = require('body-parser')
let jwt = require('jsonwebtoken')
let config = require('./secret')
let middleware = require('./middleware')
let sessions = require('./store/store')

const userName = 'veselov'
const channelMQ = userName.toUpperCase() + '_TRADE'
const rabbitmq = new (require('solid-communication-foundation'))(null, channelMQ, require('solid-logger')('scf', 'trade:rabbitmq'))
const logger = require('solid-logger')('intapi')

rabbitmq.start()

class HandlerGenerator {
  // login (req, res) {
  //   let username = req.body.username
  //   let password = req.body.password
  //   let mockedUsername = 'admin'
  //   let mockedPassword = 'password'

  //   if (username && password) {
  //     if (username === mockedUsername && password === mockedPassword) {
  //       let token = jwt.sign({
  //         username: username
  //       },
  //       config.secret,
  //       {
  //         expiresIn: '60000'
  //       })
  //       res.json({
  //         success: true,
  //         message: 'Auth successful',
  //         token
  //       })
  //     } else {
  //       res.status(403).json({
  //         success: false,
  //         message: 'Incorrect username or password'
  //       })
  //     }
  //   } else {
  //     res.status(401).json({
  //       success: false,
  //       message: 'Authorization failed. No Username or password found'
  //     })
  //   }
  // }
  login (req, res) {
    let username = req.body.username
    let password = req.body.password
    let accessToken = jwt.sign({ username: username }, config.accessSecret, { expiresIn: config.accessTokenExpireIn })
    let refreshToken = jwt.sign({ username: username }, config.refreshSecret, { expiresIn: config.refreshTokenExpireIn })
    sessions.newSession({
      username: username,
      accessToken: accessToken,
      refreshToken: refreshToken
    })
    .then(response => {
      console.log(response.username + ' session started')
      res.json({
        accessToken: accessToken,
        accessTokenExpireIn: parseInt(config.accessTokenExpireIn) * 60,
        refreshToken: refreshToken,
        refreshTokenExpireIn: parseInt(config.refreshTokenExpireIn) * 60,
      })
    })
    .catch(err => {
      res.status(401).json({
        err: 'Ошибка авторизации',
        success: false
      })
    })
  }

  index (req, res) {
    res.json({
      success: true,
      message: 'Index page'
    })
  }

  clearStore (req, res) {
    sessions.resetStorage()
    .then((response) => {
      res.sendStatus(200)
    })
  }
}

function main () {
  let app = express()
  let handlers = new HandlerGenerator()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.set('port', process.env.PORT || 3000)

  app.post('/login', handlers.login)
  app.get('/', middleware.checkToken, handlers.index)
  app.get('/reset', handlers.clearStore)

  app.listen(app.get('port'), () => {
    console.log('Server started on port ' + app.get('port') + ' in mode: ' + process.env.NODE_ENV)
  })
}

main()