const MATCH_X1 = 2;   // за 1 совпадение
const MATCH_X2 = 5;  // за 2 совпадения
const MATCH_X3 = 10; // за 3 совпадения
const LINE_MULTIPLIER = 10; // если ставка на линию
const MIN_BET = 10; // минимальная ставка

const { Users, Draws, UserInfo, Tickets } = require('../../models/models');
const ApiError = require('../../error/ApiError');
const { Op } = require('sequelize');
const sequelize = require('../../../db');

class PuzzleLotteryController {
    constructor() {
        // Привязываем методы к контексту класса
        this.createRound = this.createRound.bind(this);
        this.startLotteryProcess = this.startLotteryProcess.bind(this);
        this.determineWinners = this.determineWinners.bind(this);
        this.buyTicket = this.buyTicket.bind(this);
        this.getActiveRounds = this.getActiveRounds.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.getDrawResults = this.getDrawResults.bind(this);

        this.DRAW_DURATION =  1000*60; 
    }

    // Конвертация времени в московский часовой пояс
    convertToMoscowTime(date) {
        return new Date(date); // Убираем ручную конвертацию, так как toLocaleString сделает это автоматически
    }

    // Форматирование даты в московское время
    formatMoscowDate(date) {
        return new Date(date).toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // Форматирование времени для отображения
    formatTimeLeft(timeLeft) {
        const seconds = Math.floor(timeLeft / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Получение всех возможных линий из 3 чисел в сетке 5x5
    getAll5x5Lines() {
        const lines = [];
        const size = 5;

        // Горизонтальные линии
        for (let i = 0; i < size; i++) {
            for (let j = 0; j <= size - 3; j++) {
                lines.push([
                    [i, j], [i, j + 1], [i, j + 2]
                ]);
            }
        }

        // Вертикальные линии
        for (let j = 0; j < size; j++) {
            for (let i = 0; i <= size - 3; i++) {
                lines.push([
                    [i, j], [i + 1, j], [i + 2, j]
                ]);
            }
        }

        // Диагональные линии (сверху вниз, слева направо)
        for (let i = 0; i <= size - 3; i++) {
            for (let j = 0; j <= size - 3; j++) {
                lines.push([
                    [i, j], [i + 1, j + 1], [i + 2, j + 2]
                ]);
            }
        }

        // Диагональные линии (сверху вниз, справа налево)
        for (let i = 0; i <= size - 3; i++) {
            for (let j = size - 1; j >= 2; j--) {
                lines.push([
                    [i, j], [i + 1, j - 1], [i + 2, j - 2]
                ]);
            }
        }

        return lines;
    }

    // Генерация сетки 5x5
    generatePuzzleGrid() {
        // Создаем массив чисел от 1 до 25
        const numbers = Array.from({length: 25}, (_, i) => i + 1);

        // Алгоритм Фишера-Йейтса для перемешивания
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        // Разбиваем на матрицу 5x5
        const grid = [];
        for (let i = 0; i < 5; i++) {
            grid.push(numbers.slice(i * 5, i * 5 + 5));
        }
        return grid;
    }

    // Подсчет совпадающих чисел
    countMatchingNumbers(ticketNumbers, winningNumbers, line) {
        const lineIndices = this.getLineIndices(line);
        let matches = 0;
        
        lineIndices.forEach(([i, j]) => {
            if (ticketNumbers[i][j] === winningNumbers[i][j]) {
                matches++;
            }
        });
        
        return matches;
    }

    // Получение индексов для линии
    getLineIndices(line) {
        const lines = {
            'h1': [[0,0], [0,1], [0,2]],
            'h2': [[1,0], [1,1], [1,2]],
            'h3': [[2,0], [2,1], [2,2]],
            'v1': [[0,0], [1,0], [2,0]],
            'v2': [[0,1], [1,1], [2,1]],
            'v3': [[0,2], [1,2], [2,2]],
            'd1': [[0,0], [1,1], [2,2]],
            'd2': [[0,2], [1,1], [2,0]]
        };
        return lines[line] || [];
    }

    // Создание нового раунда
    async createRound(req, res, next) {
        try {
            console.log('Начало создания раунда');
            console.log('Параметры запроса:', req.body);
            
            const now = new Date();
            const drawData = {
                drawTime: now,
                status: 'active',
                allTickets: 0,
                soldTickets: 0,
                drawHash: null
            };
            console.log('Данные для создания раунда:', drawData);
            
            const draw = await Draws.create(drawData);
            console.log('Раунд успешно создан:', draw.toJSON());

            // Запуск процесса розыгрыша
            await this.startLotteryProcess(draw.id);
            
            const endTime = new Date(now.getTime() + this.DRAW_DURATION);
            
            return res.json({ 
                success: true, 
                drawId: draw.id,
                drawTime: this.formatMoscowDate(draw.drawTime),
                status: draw.status,
                endTime: this.formatMoscowDate(endTime),
                timeLeft: this.formatTimeLeft(this.DRAW_DURATION)
            });
        } catch (error) {
            console.error('Ошибка при создании раунда:', error);
            console.error('Стек ошибки:', error.stack);
            next(ApiError.internal('Ошибка создания раунда: ' + error.message));
        }
    }

    // Покупка билета
    async buyTicket(req, res, next) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Начало покупки билета');
            console.log('Данные запроса:', req.body);

            const { userId, drawId, selectedNumbers, betAmount } = req.body;

            // Проверка баланса
            console.log('Поиск информации о пользователе:', userId);
            const userInfo = await UserInfo.findOne({
                where: { userId },
                lock: transaction.LOCK.UPDATE,
                transaction
            });
            console.log('Информация о пользователе:', userInfo?.toJSON());

            if (!userInfo) {
                await transaction.rollback();
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            // Проверка выбранных чисел
            if (!selectedNumbers || !Array.isArray(selectedNumbers) || selectedNumbers.length !== 3) {
                 await transaction.rollback();
                 return next(ApiError.badRequest('Выберите ровно три числа!'));
            }
            // Проверка, что числа от 1 до 25 и без повторов
            const validNumbers = selectedNumbers.filter(num => num >= 1 && num <= 25);
            if (validNumbers.length !== 3 || new Set(validNumbers).size !== 3) {
                 await transaction.rollback();
                 return next(ApiError.badRequest('Выберите три уникальных числа от 1 до 25!'));
            }

            // Проверка ставки
            const bet = Number(betAmount) || MIN_BET;
            if (bet < MIN_BET) {
                await transaction.rollback();
                return next(ApiError.badRequest('Минимальная ставка: ' + MIN_BET));
            }

            if (userInfo.balance < bet) {
                await transaction.rollback();
                return next(ApiError.badRequest('Недостаточно средств'));
            }

            // Формируем данные билета - сохраняем только выбранные числа и ставку
            let ticketData = {
                selectedNumbers: validNumbers, // Сохраняем только проверенные числа
                betAmount: bet // Сохраняем ставку
            };

            // Сохраняем билет
            console.log('Создание билета');
            const ticket = await Tickets.create({
                userId,
                drawId,
                choosenNumber: JSON.stringify(ticketData),
                price: bet, // Цена билета = ставка
                isWinner: false
            }, { transaction });
            console.log('Билет создан:', ticket.toJSON());

            // Списание средств
            console.log('Списание средств');
            await UserInfo.update(
                { balance: userInfo.balance - bet },
                { where: { userId }, transaction }
            );

            // Обновление счетчиков розыгрыша
            console.log('Обновление счетчиков розыгрыша');
            await Draws.update(
                {
                    "soldTickets": sequelize.literal('"soldTickets" + 1'),
                    "allTickets": sequelize.literal('"allTickets" + 1')
                },
                { where: { id: drawId }, transaction }
            );

            await transaction.commit();
            console.log('Транзакция успешно завершена');

            return res.json({
                success: true,
                ticketId: ticket.id,
                selectedNumbers: ticketData.selectedNumbers,
                betAmount: bet
            });
        } catch (error) {
            console.error('Ошибка при покупке билета:', error);
            console.error('Стек ошибки:', error.stack);
            await transaction.rollback();
            next(ApiError.internal('Ошибка покупки билета: ' + error.message));
        }
    }

    // Процесс розыгрыша
    async startLotteryProcess(drawId) {
        try {
            const draw = await Draws.findByPk(drawId);

            const lotteryProcess = async () => {
                const transaction = await sequelize.transaction();

                try {
                    // Генерируем выигрышную сетку (для прозрачности, не для определения выигрыша)
                    const winningGrid = this.generatePuzzleGrid();

                    // Генерируем 3 случайных выигрышных числа (для определения выигрыша)
                    const allNumbers = Array.from({length: 25}, (_, i) => i + 1);
                    const winningNumbers = [];
                    while (winningNumbers.length < 3) {
                        const idx = Math.floor(Math.random() * allNumbers.length);
                        winningNumbers.push(allNumbers.splice(idx, 1)[0]);
                    }

                    console.log('Выигрышные числа раунда', drawId, ':', winningNumbers);

                    // Обновляем розыгрыш
                    await Draws.update({
                        status: 'completed',
                        drawHash: JSON.stringify({
                            winningGrid: winningGrid, // сохраняем сетку для информации
                            winningNumbers: winningNumbers // сохраняем 3 выигрышных числа
                        })
                    }, {
                        where: { id: drawId },
                        transaction
                    });

                    // Определяем победителей с новыми выигрышными числами
                    await this.determineWinners(drawId, winningNumbers, transaction);

                    await transaction.commit();
                } catch (error) {
                    await transaction.rollback();
                    console.error('Ошибка в процессе розыгрыша:', error);
                }
            };

            setTimeout(lotteryProcess, this.DRAW_DURATION);

        } catch (error) {
            console.error('Ошибка запуска процесса розыгрыша:', error);
        }
    }

    // Определение победителей
    async determineWinners(drawId, winningNumbers, transaction) { // Принимаем 3 выигрышных числа (1-25)
        const tickets = await Tickets.findAll({
            where: { drawId },
            transaction
        });

        // Получаем все возможные линии из 3 чисел в сетке 5x5
        const all5x5Lines = this.getAll5x5Lines();
        
        // Генерируем временную сетку 5x5, чтобы получить числа для линий
        // Это нужно для проверки, является ли выбранная игроком комбинация чисел ЛИНИЕЙ
        // Важно: эта сетка не используется для определения выигрышных номеров,
        // выигрыш определяется только по winningNumbers (3 случайных числа)
        const tempGrid = this.generatePuzzleGrid();
        
        const allLineNumberSets = all5x5Lines.map(lineIndices => {
            const lineNumbers = lineIndices.map(([i, j]) => tempGrid[i][j]);
            return lineNumbers.sort((a, b) => a - b); // Сортируем для сравнения
        });

        for (const ticket of tickets) {
            const ticketData = JSON.parse(ticket.choosenNumber);
            const userNumbers = (ticketData.selectedNumbers || []).sort((a, b) => a - b); // Получаем и сортируем выбранные числа игрока
            const bet = ticket.price; // Ставка сохранена в price

            // Считаем совпадения между выбранными числами игрока и 3 выигрышными числами
            let matchCount = 0;
            for (let num of userNumbers) {
                if (winningNumbers.includes(num)) matchCount++;
            }

            // Проверяем, являются ли выбранные числа игрока линией из 3 чисел в сетке 5x5
            let isUserLine = false;
            if (userNumbers.length === 3) { // Проверяем только если выбрано 3 числа
                 for (let lineNumberSet of allLineNumberSets) {
                     // Сравниваем отсортированные массивы, так как порядок не важен
                     if (JSON.stringify(lineNumberSet) === JSON.stringify(userNumbers)) {
                         isUserLine = true;
                         break;
                     }
                 }
            }

            let prize = 0;
            if (matchCount === 1) prize = bet * MATCH_X1;
            if (matchCount === 2) prize = bet * MATCH_X2;
            if (matchCount === 3) prize = bet * MATCH_X3;

            // Применяем дополнительный коэффициент, если угаданы все 3 числа И они образуют линию
            if (isUserLine && matchCount === 3) prize *= LINE_MULTIPLIER;

            if (prize > 0) {
                await Tickets.update(
                    {
                        isWinner: true,
                        price: prize
                    },
                    {
                        where: { id: ticket.id },
                        transaction
                    }
                );

                const userInfo = await UserInfo.findOne({
                    where: { userId: ticket.userId },
                    lock: transaction.LOCK.UPDATE,
                    transaction
                });

                await UserInfo.update(
                    { balance: userInfo.balance + prize },
                    {
                        where: { userId: ticket.userId },
                        transaction
                    }
                );
            } else {
                 await Tickets.update(
                    {
                        isWinner: false,
                        price: 0
                    },
                    {
                        where: { id: ticket.id },
                        transaction
                    }
                );
            }
        }
    }

    // Получение активных раундов
    async getActiveRounds(req, res, next) {
        try {
            console.log('Запрос на получение активных раундов');
            const draws = await Draws.findAll({
                where: {
                    status: 'active'
                },
                order: [['drawTime', 'ASC']]
            });

            const drawsWithTimeLeft = draws.map(draw => {
                const endTime = new Date(draw.drawTime.getTime() + this.DRAW_DURATION);
                const timeLeft = Math.max(0, endTime - new Date());
                
                return {
                    ...draw.toJSON(),
                    drawTime: this.formatMoscowDate(draw.drawTime),
                    endTime: this.formatMoscowDate(endTime),
                    timeLeft: this.formatTimeLeft(timeLeft)
                };
            });

            console.log('Найдены активные раунды:', drawsWithTimeLeft);

            return res.json(drawsWithTimeLeft);
        } catch (error) {
            console.error('Ошибка при получении активных раундов:', error);
            next(ApiError.internal('Ошибка получения активных раундов'));
        }
    }

    // Получение истории раундов
    async getHistory(req, res, next) {
        try {
            const draws = await Draws.findAll({
                where: { status: 'completed' },
                order: [['drawTime', 'DESC']],
                limit: 10,
                include: [{
                    model: Tickets,
                    where: { isWinner: true },
                    required: false
                }]
            });

            const formattedDraws = draws.map(draw => ({
                ...draw.toJSON(),
                drawTime: this.formatMoscowDate(draw.drawTime)
            }));

            return res.json(formattedDraws);
        } catch (error) {
            next(ApiError.internal('Ошибка получения истории'));
        }
    }

    // Получение результатов розыгрыша
    async getDrawResults(req, res, next) {
        try {
            const { drawId, userId } = req.query;
            console.log('Запрос результатов розыгрыша:', { drawId, userId });

            const draw = await Draws.findByPk(drawId);
            if (!draw) {
                return next(ApiError.badRequest('Розыгрыш не найден'));
            }

            const tickets = await Tickets.findAll({
                where: { 
                    drawId,
                    userId: userId || { [Op.ne]: null }
                }
            });

            // Получаем все возможные линии из 3 чисел в сетке 5x5
            const all5x5Lines = this.getAll5x5Lines();

            // Генерируем временную сетку 5x5, чтобы получить числа для линий
            const tempGrid = this.generatePuzzleGrid();

            const allLineNumberSets = all5x5Lines.map(lineIndices => {
                const lineNumbers = lineIndices.map(([i, j]) => tempGrid[i][j]);
                return lineNumbers.sort((a, b) => a - b); // Сортируем для сравнения
            });

            const results = tickets.map(ticket => {
                const ticketData = JSON.parse(ticket.choosenNumber);
                const drawData = draw.drawHash ? JSON.parse(draw.drawHash) : null;

                const userNumbers = (ticketData.selectedNumbers || []).sort((a, b) => a - b); // Получаем и сортируем выбранные числа
                const betAmount = ticketData.betAmount;

                // Проверяем, являются ли выбранные числа игрока линией из 3 чисел в сетке 5x5
                let isUserLine = false;
                if (userNumbers.length === 3) { // Проверяем только если выбрано 3 числа
                     for (let lineNumberSet of allLineNumberSets) {
                         // Сравниваем отсортированные массивы, так как порядок не важен
                         if (JSON.stringify(lineNumberSet) === JSON.stringify(userNumbers)) {
                             isUserLine = true;
                             break;
                         }
                     }
                }

                let result = {
                    ticketId: ticket.id,
                    selectedNumbers: ticketData.selectedNumbers, // Выбранные игроком числа
                    betAmount: ticketData.betAmount,           // Сумма ставки
                    isUserLine: isUserLine,                    // Являются ли выбранные числа линией в сетке 5x5
                    isWinner: ticket.isWinner,
                    prize: ticket.price
                };

                if (drawData) {
                    result.winningNumbers = drawData.winningNumbers;
                }

                // Дополнительная информация для отладки (опционально)
                // if (drawData && drawData.winningNumbers) {
                //     const winningNumbers = drawData.winningNumbers;
                //     let matchCount = 0;
                //     for (let num of userNumbers) {
                //         if (winningNumbers.includes(num)) matchCount++;
                //     }
                //     result.matchCount = matchCount;
                // }

                return result;
            });

            return res.json({
                drawId,
                status: draw.status,
                drawTime: this.formatMoscowDate(draw.drawTime),
                winningNumbers: draw.drawHash ? JSON.parse(draw.drawHash).winningNumbers : null, // Добавляем 3 выигрышных числа раунда
                results
            });

        } catch (error) {
            console.error('Ошибка при получении результатов:', error);
            next(ApiError.internal('Ошибка получения результатов розыгрыша'));
        }
    }
}

module.exports = new PuzzleLotteryController(); 