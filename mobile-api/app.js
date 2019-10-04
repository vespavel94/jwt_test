const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes/routes')

const userName = 'veselov'
const channelMQ = userName.toUpperCase() + '_TRADE'
const rabbitmq = new (require('solid-communication-foundation'))(null, channelMQ, require('solid-logger')('scf', 'trade:rabbitmq'))
const logger = require('solid-logger')('intapi')

rabbitmq.start()

function main () {
  let app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.set('port', process.env.PORT || 3000)

  app.use('/', routes)

  app.listen(app.get('port'), () => {
    console.log('Server started on port ' + app.get('port') + ' in mode: ' + process.env.NODE_ENV)
  })
}

main()