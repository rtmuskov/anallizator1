const Router = require('express')
const router = new Router()
const measurementController = require('../controller/measurementController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', authMiddleware, measurementController.create) // Маршрут для создания измерения (требует авторизации)
router.get('/', authMiddleware, measurementController.getAll) // Маршрут для получения всех измерений пользователя (требует авторизации)

module.exports = router 