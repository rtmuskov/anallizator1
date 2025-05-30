const Router = require('express')
const router = new Router()
const userController = require('../controller/userController')
const authMiddleware = require('../middleware/authMiddleware')
const measurementRouter = require('./measurementRouter')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)

// Маршруты для профиля пользователя
router.get('/user/profile', authMiddleware, userController.getUserProfile);
router.put('/user/profile', authMiddleware, userController.updateUserProfile);

router.use('/measurement', measurementRouter)

module.exports = router 