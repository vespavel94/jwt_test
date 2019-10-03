let jwt = require('jsonwebtoken')
let config = require('./secret')
let store = require('./store/store')

let checkToken = (req, res, next) => {
  let accessToken = req.headers['x-auth-token']
  if (accessToken) {
    jwt.verify(accessToken, config.accessSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          message: 'Токен устарел или неверный'
        })
      } else {
        console.log(decoded)
        store.getSession('username', decoded.username)
        .then(response => {
          next()
        })
        .catch(err => {
          res.status(401).json({
            err: 'Сессия не найдена',
            status: 401
          })
        })
      }
    })
  }
  else {
    return res.status(401).json({
      message: 'Токен не найден',
      status: 401
    })
  }
}

module.exports = {
  checkToken
}