const Datastore = require('nedb')
const moment = require('moment')
const uuid = require('uuid/v4')

function Session (params) {
  this.id = uuid()
  this.username = params.username,
  this.accessToken = params.accessToken,
  this.accessTokenValidDue = moment().add(300, 'seconds').format('YYYY-MM-DD, HH:mm:ss')
  this.refreshToken = params.refreshToken,
  this.refreshTokenValidDue = moment().add(600, 'seconds').format('YYYY-MM-DD, HH:mm:ss')
  this.created = moment().format('YYYY-MM-DD, HH:mm:ss')
}

module.exports = {
  sessions: new Datastore({
    filename: 'store/sessions',
    autoload: true
  }),

  newSession (params) {
    return new Promise((resolve, reject) => {
      let session = new Session(params)
      this.sessions.insert(session, (err, record) => {
        if (err) {
          reject(err)
        } else {
          resolve(record)
        }
      })
    })
  },

  getSession (key, val) {
    return new Promise((resolve, reject) => {
      this.sessions.findOne({ [key]: val }, (err, record) => {
        if (err) {
          console.log('Error: ' + err)
          reject(err)
        } else {
          if (record !== null) {
            resolve(record)
          } else {
            reject('Record not found!')
          }
        }
      })
    })
  },

  resetStorage () {
    return new Promise((resolve, reject) => {
      this.sessions.remove({}, { multi: true })
      resolve()
    })
  }
}