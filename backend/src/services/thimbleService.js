const { User, ThimbleGame } = require('../models/models');

exports.canPlay = async (userId) => {
    const user = await User.findByPk(userId);
    const now = new Date();
    const lastPlay = user.lastThimblePlay || new Date(0);
    const canPlay = now - lastPlay > 24 * 60 * 60 * 1000;

    return { canPlay, nextPlay: new Date(lastPlay.getTime() + 24 * 60 * 60 * 1000) };
};

exports.startGame = async (userId) => {
    const user = await User.findByPk(userId);
    if (new Date() - new Date(user.lastThimblePlay || 0) < 24 * 60 * 60 * 1000) {
        throw new Error('Вы можете играть раз в 24 часа');
    }

    const correctCup = Math.floor(Math.random() * 3);

    const game = await ThimbleGame.create({
        UserId: userId,
        correctCup,
    });

    return { gameId: game.id };
};

exports.checkGuess = async (userId, selectedCup) => {
    const game = await ThimbleGame.findOne({
        where: { UserId: userId },
        order: [['createdAt', 'DESC']],
    });

    if (!game) throw new Error('Сначала начните игру');
    if (game.wasWin !== null) throw new Error('Уже сыграно');

    const wasWin = game.correctCup === selectedCup;

    game.selectedCup = selectedCup;
    game.wasWin = wasWin;
    await game.save();

    if (wasWin) {
        await User.increment({ bonuses: 10 }, { where: { id: userId } });
    }

    await User.update({ lastThimblePlay: new Date() }, { where: { id: userId } });

    return { wasWin, correctCup: game.correctCup };
};
