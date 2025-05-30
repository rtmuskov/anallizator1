const { Measurement } = require('../models/models');

class MeasurementController {
    async create(req, res) {
        try {
            console.log('Получены данные для создания измерения:', req.body);
            const { date, weight, fatMass, skeletalMuscleMass, visceralFat, waterPercentage, basalMetabolicRate, metabolicAge } = req.body;
            // Получаем id пользователя из объекта req.user, который добавляется authMiddleware
            const userId = req.user.id;

            const measurement = await Measurement.create({ date, weight, fatMass, skeletalMuscleMass, visceralFat, waterPercentage, basalMetabolicRate, metabolicAge, userId });

            return res.json(measurement);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при сохранении измерения' });
        }
    }

    async getAll(req, res) {
        try {
            // Получаем id пользователя из объекта req.user
            const userId = req.user.id;

            const measurements = await Measurement.findAll({
                where: { userId },
                order: [['date', 'ASC']], // Сортируем по дате
            });

            console.log('Отправляем измерения клиенту:', measurements);

            return res.json(measurements);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при получении измерений' });
        }
    }

    // Можете добавить другие методы, например, для обновления или удаления
}

module.exports = new MeasurementController(); 