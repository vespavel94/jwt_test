const Datastore = require('nedb')
const moment = require('moment')
const config = require('../secret/secret')

function Session (params) {
  this.id = params.id
  this.username = params.username,
  this.accessToken = params.accessToken,
  this.accessTokenValidDue = moment().add(parseInt(config.accessTokenExpireIn), 'seconds').format('YYYY-MM-DD, HH:mm:ss')
  this.refreshToken = params.refreshToken,
  this.refreshTokenValidDue = moment().add(parseInt(config.refreshTokenExpireIn), 'seconds').format('YYYY-MM-DD, HH:mm:ss')
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

  updateSession (session, params) {
    return new Promise((resolve, reject) => {
      this.sessions.update(session, { $set: params }, (err, updated) => {
        if (err) {
          reject()
        } else {
          this.sessions.persistence.compactDatafile()
          resolve(updated)
        }
      })
    })
  },

  removeSession (session) {
    return new Promise((resolve, reject) => {
      this.sessions.remove(session, (err, num) => {
        if (err) {
          reject('Ошибка при удалении')
        }
        else {
          this.sessions.persistence.compactDatafile()
          resolve()
        }
      })
    })
  },

  resetStorage () {
    return new Promise((resolve, reject) => {
      this.sessions.remove({}, { multi: true }, (err, num) => {
        if (err) {
          reject()
        } else {
          resolve()
        }
      })
    })
  }
}