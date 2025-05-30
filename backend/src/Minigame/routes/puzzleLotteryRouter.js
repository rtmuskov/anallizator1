const Router = require('express');
const puzzleLotteryController = require('../controllers/PuzzleLotteryController');
const authMiddleware = require('../../middleware/authHandlingMiddleWare');

const router = new Router();

router.post('/create', authMiddleware, puzzleLotteryController.createRound);
router.post('/buy-ticket', authMiddleware, puzzleLotteryController.buyTicket);
router.get('/active', puzzleLotteryController.getActiveRounds);
router.get('/history', puzzleLotteryController.getHistory);
router.get('/results', puzzleLotteryController.getDrawResults);

module.exports = router; 