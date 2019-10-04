const config = require('../secret/secret')
const jwt = require('jsonwebtoken')
const sessions = require('../store/store')
const uuid = require('uuid/v4')

const handlers = {
  login (req, res) {
    let username = req.body.username
    let password = req.body.password
    let id = uuid()
    let accessToken = jwt.sign({ usr: username, id: id }, config.accessSecret, { expiresIn: config.accessTokenExpireIn })
    let refreshToken = jwt.sign({ usr: username, id: id }, config.refreshSecret, { expiresIn: config.refreshTokenExpireIn })
    sessions.newSession({
      id: id,
      username: username,
      accessToken: accessToken,
      refreshToken: refreshToken
    })
    .then(response => {
      console.log(response.username + ' session started')
      res.json({
        accessToken: accessToken,
        accessTokenExpireIn: parseInt(config.accessTokenExpireIn),
        refreshToken: refreshToken,
        refreshTokenExpireIn: parseInt(config.refreshTokenExpireIn),
      })
    })
    .catch(err => {
      res.status(401).json({
        err: 'Ошибка авторизации',
        success: false
      })
    })
  },

  index (req, res) {
    res.json({
      success: true,
      message: 'Index page'
    })
  },

  clearStore (req, res) {
    sessions.resetStorage()
    .then((response) => {
      res.sendStatus(200)
    })
  },

  refreshToken (req, res) {
    if (!req.body.refreshToken) {
      res.status(401).json({
        success: false,
        err: 'Токен не найден'
      })
    } else {
      sessions.getSession('refreshToken', req.body.refreshToken)
      .then(response => {
        console.log('Record found')
        console.log(response)
        oldSession = response
        let id = uuid()
        let newAccessToken = jwt.sign({ usr: oldSession.username, id: id }, config.accessSecret, { expiresIn: config.accessTokenExpireIn })
        let newRefreshToken = jwt.sign({ usr: oldSession.username, id: id }, config.refreshSecret, { expiresIn: config.refreshTokenExpireIn })
        sessions.updateSession(oldSession, { 
          id: id, 
          accessToken: newAccessToken, 
          refreshToken: newRefreshToken 
        })
        .then((response) => {
          console.log('Record updated')
          console.log(response)
          res.json({
            accessToken: newAccessToken,
            accessTokenExpireIn: parseInt(config.accessTokenExpireIn),
            refreshToken: newRefreshToken,
            refreshTokenExpireIn: parseInt(config.refreshTokenExpireIn)
          })
        })
        .catch(() => {
          res.status(401).json({
            success: false,
            err: 'Ошибка обновления сессии'
          })
        })
      })
      .catch(() => {
        res.status(401).json({
          success: false, 
          err: 'Токен обновления недействителен'
        })
      })
    }
  },

  logout (req, res) {
    let accessToken = req.headers['x-auth-token']
    sessions.getSession('accessToken', accessToken)
    .then((response) => {
      sessions.removeSession(response)
      .then(() => {
        console.log('logout successful')
        res.sendStatus(200)
      })
      .catch(() => {
        res.status(401).json({
          success: false,
          err: 'Ошибка удаления сессии'
        })
      })
    })
    .catch(() => {
      res.json({
        success: false,
        err: 'Не удалось найти сессию'
      })
    })
  }
}

module.exports = handlers