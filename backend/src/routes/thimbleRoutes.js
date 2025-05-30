const express = require('express');
const router = express.Router();
const controller = require('../controller/thimbleController');
const auth = require('../middleware/authHandlingMiddleWare');

router.get('/status', auth, controller.getStatus);
router.post('/start', auth, controller.startGame);
router.post('/guess', auth, controller.guess);

module.exports = router;
