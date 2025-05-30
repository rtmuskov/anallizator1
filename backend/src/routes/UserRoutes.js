const Router = require('express')
const router = new Router()
const passport = require('../passport');
const userController = require('../controller/UserController')
const authMiddleware = require('../middleware/authHandlingMiddleware')



router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.post('/telegram-login', userController.telegramLogin);
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    prompt: 'select_account' 
}));
router.get('/google/callback', passport.authenticate('google', { session: false }), userController.googleCallback);




module.exports = router
