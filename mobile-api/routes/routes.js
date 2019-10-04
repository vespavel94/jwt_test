const router = require('express').Router()
const handlers = require('../handlers/handlers')
const middleware = require('../middleware/middleware')

router.post('/login', handlers.login) // init session
router.get('/', middleware.checkToken, handlers.index) // check secure access
router.get('/reset', handlers.clearStore) // reset storage
router.post('/refresh-token', handlers.refreshToken) // token refresh
router.post('/logout', middleware.checkToken, handlers.logout)

module.exports = router