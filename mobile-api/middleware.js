let jwt = require('jsonwebtoken')
let config = require('./secret')
let store = require('./store/store')

let checkToken = (req, res, next) => {
  let accessToken = req.headers['x-auth-token'] || req.headers['authorization']
  if (accessToken.startsWith('Bearer ')) {
    accessToken = accessToken.slice(7, accessToken.length)
  }
  if (accessToken) {
    jwt.verify(accessToken, config.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid'
        })
      } else {
        req.decoded = decoded
        console.log(decoded.username)
        store.getSession(decoded.username)
        .then(response => {
          console.log('success')
          next()
        })
        .catch(err => {
          res.status(401).json({
            err: err,
            success: false
          })
        })
      }
    })
  }
  else {
    return res.json({
      success: false,
      message: 'No token found'
    })
  }
}

module.exports = {
  checkToken
}