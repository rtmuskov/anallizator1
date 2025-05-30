const {Router} = require('express')
const router = new Router();
const FirstGameController = require('../controllers/FgameController')
const authMiddleware = require('../../middleware/authHandlingMiddleWare')

router.post("/create", authMiddleware, FirstGameController.Create);
router.post("/buyTicket", authMiddleware, FirstGameController.buyTicket);
router.post("/buyRandomTicket", authMiddleware, FirstGameController.Winners);
router.post("/:drawId/run", authMiddleware, FirstGameController.DrawRun);
router.get("/winners", authMiddleware, FirstGameController.Winners);
router.get("/history", authMiddleware, FirstGameController.History);
router.get("/:userId/balance", authMiddleware, FirstGameController.Balance);
router.get("/:drawId/verify", authMiddleware, FirstGameController.DrawRun);

module.exports = router;