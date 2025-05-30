const service = require('../services/thimbleservice.js');

exports.getStatus = async (req, res) => {
    const result = await service.canPlay(req.user.id);
    res.json(result);
};

exports.startGame = async (req, res) => {
    const result = await service.startGame(req.user.id);
    res.json(result);
};

exports.guess = async (req, res) => {
    const { selectedCup } = req.body;
    const result = await service.checkGuess(req.user.id, selectedCup);
    res.json(result);
};
