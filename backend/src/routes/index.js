const Router = require('express')
const router = new Router()
const userRouter = require('./UserRoutes')
const userinfoRouter = require('./UserInfoRoutes')
const thimbleRoutes = require('./ThimbleRoutes')
const TimeGame = require('../Minigame/routes/FirstGameRouter');
const puzzleLotteryRouter = require('../Minigame/routes/puzzleLotteryRouter');

router.use('/user', userRouter)
router.use('/userinfo', userinfoRouter)
router.use('/thimble', thimbleRoutes)
router.use('/draw', TimeGame)
router.use('/puzzle', puzzleLotteryRouter)

module.exports = router