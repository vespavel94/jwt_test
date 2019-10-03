const Datastore = require('nedb')

module.exports = {
  sessions: new Datastore({
    filename: 'store/sessions',
    autoload: true
  }),

  newSession (params) {
    return new Promise((resolve, reject) => {
      this.sessions.insert({
        username: params.username,
        accessToken: params.accessToken,
        refreshToken: params.refreshToken
      }, (err, record) => {
        if (err) {
          reject(err)
        } else {
          resolve(record)
        }
      })
    })
  },

  getSession (param) {
    return new Promise((resolve, reject) => {
      this.sessions.findOne({ "username": param }, (err, record) => {
        if (err) {
          console.log('Error: ' + err)
          reject(err)
        } else {
          if (record !== null) {
            console.log("Ok: " + JSON.stringify(record))
            resolve(record)
          } else {
            console.log('Error')
            reject('Record not found!')
          }
        }
      })
    })
  }
}