let jwt = require('jsonwebtoken')
let config = require('./secret')

let checkToken = (req, res, next) => {
  let token = req.headers['x-auth-token'] || req.headers['authorization']
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length)
  }
  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid'
        })
      } else {
        req.decoded = decoded
        next()
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