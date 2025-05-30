const {Users, Draws, UserInfo, Tickets} = require('../../models/models')
const axios = require('axios')

const LOTTERY_DURATION = 5 * 60 * 1000;


async function getBitcoinBlockHash() {
  try {
    const response = await axios.get('https://blockstream.info/api/blocks/tip/hash');
    return response.data;
  } catch (error) {
    console.error('Error fetching Bitcoin hash:', error);
    throw error;
  }
}

// Функция генерации выигрышного числа из хеша
function generateWinningNumber(hash) {
  const digits = hash.replace(/[^0-9]/g, '');
  if (digits.length < 5) {
    return Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  }
  
  const startIndex = Math.floor(Math.random() * (digits.length - 5));
  console.log(digits.substring(startIndex, startIndex + 5))
  return digits.substring(startIndex, startIndex + 5);
}

 // Вспомогательные функции
function countMatchingDigits(number1, number2) {
  let matches = 0;
  for (let i = 0; i < 5; i++) {
    if (number1[i] === number2[i]) matches++;
  }
  return matches;
}

function calculatePrize(matchCount) {
  const prizes = {
    0: 0,
    1: 0,
    2: 10,    // Малый приз
    3: 100,   // Средний приз
    4: 1000,  // Крупный приз
    5: 10000  // Джекпот
  };
  return prizes[matchCount] || 0;
}

async function createNextDrawAutomatically() {
  const draw = await Draws.create({
    drawTime: new Date(),
    status: 'active',
    allTickets: 0,
    soldTickets: 0,
    drawHash: null
  });

  startLotteryProcess(draw.id);
  console.log(`Автоматически запущена новая лотерея ID: ${draw.id}`);
}

// Определение победителей
async function determineWinners(drawId, winningNumber) {
  const tickets = await Tickets.findAll({ where: { drawId: drawId } });
  
  for (const ticket of tickets) {
    const matchCount = countMatchingDigits(ticket.choosenNumber, winningNumber);
    
    if (matchCount >= 2) {
      const prize = calculatePrize(matchCount);
      
      await Tickets.update(
        {
          isWinner: true,
          price: prize
        },
        { where: { id: ticket.id } }
      );

      // Начисляем выигрыш
      const userInfo = await UserInfo.findOne({ where: { userId: ticket.userId } });
      await UserInfo.update(
        { balance: userInfo.balance + prize },
        { where: { userId: ticket.userId } }
      );
    }
  }
}

async function startLotteryProcess(drawId) {
  try {
    // 1. Случайное время определения результата (от 10 сек до 4.5 минут)
    const resultDelay = Math.floor(Math.random() * (270000 - 10000) + 10000);
    
    setTimeout(async () => {
      // 2. Определяем результат в случайный момент
      const bitcoinHash = await getBitcoinBlockHash();
      const winningNumber = generateWinningNumber(bitcoinHash);
      const resultTime = new Date();

      // 3. Обновляем лотерею
      await Draws.update({
        status: 'completed',
        drawHash: bitcoinHash
      }, { where: { id: drawId } });

      // 4. Определяем победителей
      await determineWinners(drawId, winningNumber);

      console.log(`Лотерея ${drawId} завершена. Выигрышный номер: ${winningNumber}`);

    }, resultDelay);

    // 5. Через 5 минут запускаем следующую лотерею
    setTimeout(() => {
      createNextDrawAutomatically();
    }, LOTTERY_DURATION);

  } catch (error) {
    console.error('Error in lottery process:', error);
  }
}

class MainLotareya {

    async Create(req, res) {
  try {
    // Проверка прав администратора
        //if  (req.user.role !== 'admin') {
        // res.status(403).json({ error: 'Forbidden' });
        //}

        const now = new Date();
    
    // Определяем время следующего розыгрыша
    // (следующая 5-минутная отметка после текущего времени)
    const draw = await Draws.create({
      drawTime: new Date(), // Текущее время как время старта
      status: 'active',
      allTickets: 100,
      soldTickets: 0,
      drawHash: null // Время, когда определится результат
    });

    // 2. Запускаем процесс лотереи
    startLotteryProcess(draw.id);

    res.json({
      success: true,
      drawId: draw.id,
      drawTime: draw.drawTime,
      status: draw.status,
      message: 'Лотерея началась. Результат будет определен случайным образом в течение 5 минут.'
    });
    } catch (error) {
        console.error('Error creating draw:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    }    

    async buyTicket(req, res) {
    try {
       const { userId, drawId, number } = req.body;
    
    // Проверка существования пользователя и розыгрыша
    const user = await Users.findByPk(userId);
    const draw = await Draws.findByPk(drawId);
  
    if (!user || !draw) {
      return res.status(404).json({ error: 'User or draw not found' });
    }
    
    // Проверка баланса
    const userInfo = await UserInfo.findOne({ where: { userId: userId } });
    if (userInfo.balance < 1) { // Предполагаем стоимость билета 1 единица
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Генерация номера, если выбран "random"
    const ticketNumber = number === 'random' 
      ? Math.floor(Math.random() * 100000).toString().padStart(5, '0')
      : number;
    
    // Проверка формата номера
    if (!/^\d{5}$/.test(ticketNumber)) {
      return res.status(400).json({ error: 'Invalid ticket number format' });
    }
    
    // Создание билета
    const ticket = await Tickets.create({
      userId: userId,
      drawId: drawId,
      choosenNumber: ticketNumber,
      price: 1,
      isWinner: false
    });
    
    // Обновление баланса пользователя
    await UserInfo.update(
      { balance: userInfo.balance - 1 },
      { where: { userId: userId } }
    );
    
    // Обновление счетчиков розыгрыша
    await Draws.update(
      { 
        soldTickets: draw.soldTickets + 1,
      },
      { where: { id: drawId } }
    );
    
    res.json({
      success: true,
      ticketId: ticket.id,
      number: ticket.choosenNumber,
      newBalance: userInfo.balance - 1
    });
    } catch (error) {
        console.error('Error choosing number:', error);
        res.status(500).json({ error: 'Internal server error' });
        }
    }

    async DrawRun(req, res) {
  try {
    const { drawId } = req.params;
    
    // Проверка прав администратора
    //if (!req.user || req.user.role !== 'admin') {
      //return res.status(403).json({ error: 'Forbidden' });
    //}
    
    // Получаем данные розыгрыша
    const draw = await Draws.findByPk(drawId);
    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }
    
    // Получаем хеш Bitcoin
    const bitcoinHash = await getBitcoinBlockHash();
    const winningNumber = generateWinningNumber(bitcoinHash);
    
    // Обновляем розыгрыш
    await Draws.update(
      {
        status: 'completed',
        drawHash: bitcoinHash
      },
      { where: { id: drawId } }
    );
    
    // Находим все билеты этого розыгрыша
    const tickets = await Tickets.findAll({ where: { drawId: drawId } });
    
    // Определяем победителей
    const winners = [];
    
    for (const ticket of tickets) {
      const matchCount = countMatchingDigits(ticket.choosenNumber, winningNumber);
      
      if (matchCount >= 2) {
        const prize = calculatePrize(matchCount);
        
        await Tickets.update(
          {
            isWinner: true,
            price: prize
          },
          { where: { id: ticket.id } }
        );
        
        // Начисляем выигрыш пользователю
        const userInfo = await UserInfo.findOne({ where: { userId: ticket.userId } });
        await UserInfo.update(
          { balance: userInfo.balance + prize },
          { where: { userId: ticket.userId } }
        );
        
        winners.push({
          userId: ticket.userId,
          ticketId: ticket.id,
          number: ticket.choosenNumber,
          matched: matchCount,
          prize: prize
        });
      }
    }
    
    res.json({
      success: true,
      drawId: draw.id,
      winningNumber,
      bitcoinHash,
      winnersCount: winners.length,
      winners
    });
    
  } catch (error) {
    console.error('Error running draw:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
   
// Проверка выигрышных билетов
async Winners(req, res) {
  try {
    const { drawId } = req.body;

    const draw = await Draws.findByPk(drawId);
    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    const winningTickets = await Tickets.findAll({ 
      where: { 
        drawId: drawId,
        isWinner: true
      },
      include: [{
        model: Users,
        attributes: ['email']
      }]
    });

    const winners = winningTickets.map(ticket => ({
      userId: ticket.userId,
      ticketId : ticket.ticketId,
      ticketNumber: ticket.choosenNumber,
      prize: ticket.price,
      matchedDigits: countMatchingDigits(ticket.choosenNumber, draw.drawHash)
    }));

    res.json({
      drawId: draw.id,
      winningNumber: generateWinningNumber(draw.drawHash),
      winners
    });

  } catch (error) {
    console.error('Error fetching winners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async History(req, res) {
  try {
    const draws = await Draws.findAll({
      where: {
        status: 'completed'
      },
      order: [['drawTime', 'DESC']],
      limit: 10
    });

    const history = await Promise.all(draws.map(async draw => {
      const winnersCount = await Tickets.count({
        where: {
          drawId: draw.id,
          isWinner: true
        }
      });
      
      return {
        id: draw.id,
        drawTime: draw.drawTime,
        winningNumber: draw.drawHash,
        winnersCount: winnersCount
      };
    }));

    res.json(history);

  } catch (error) {
    console.error('Error fetching draw history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async Balance(req, res) {
  try {
    const userId = req.params.userId;
    const { amount } = req.body;

    // Проверка прав
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const userInfo = await UserInfo.findOne({ where: { userId: userId } });
    if (!userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newBalance = parseFloat(userInfo.balance) + parseFloat(amount);
    await UserInfo.update(
      { balance: newBalance },
      { where: { userId: userId } }
    );

    res.json({
      success: true,
      newBalance: newBalance
    });

  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

 async BuyRundomTicket(req, res) {
  try {
    const { userId, drawId } = req.body;

    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await Users.findByPk(userId);
    const draw = await Draws.findByPk(drawId);

    if (!user || !draw) {
      return res.status(404).json({ error: 'User or draw not found' });
    }

    const userInfo = await UserInfo.findOne({ where: { userId: userId } });
    if (userInfo.balance < 1) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const randomNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const ticket = await Tickets.create({
      userId: userId,
      drawId: drawId,
      choosenNumber: randomNumber,
      price: 1,
      isWinner: false
    });

    await UserInfo.update(
      { balance: userInfo.balance - 1 },
      { where: { userId: userId } }
    );

    await Draws.update(
      { 
        soldTickets: draw.soldTickets + 1,
        allTickets: draw.allTickets + 1
      },
      { where: { id: drawId } }
    );

    res.json({
      success: true,
      ticketId: ticket.id,
      number: ticket.choosenNumber,
      newBalance: userInfo.balance - 1
    });

  } catch (error) {
    console.error('Error purchasing random ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async GetActiveDrows(req, res) {
  try {
    const currentTime = new Date();
    
    const activeDraws = await Draws.findAll({
      where: {
        status: 'pending',
        drawTime: {
          [Sequelize.Op.gt]: currentTime
        }
      },
      order: [['drawTime', 'ASC']]
    });

    const result = await Promise.all(activeDraws.map(async draw => {
      const ticketsSold = await Tickets.count({
        where: {
          drawId: draw.id
        }
      });
      
      return {
        id: draw.id,
        drawTime: draw.drawTime,
        ticketsSold: ticketsSold,
        status: draw.status
      };
    }));

    res.json(result);

  } catch (error) {
    console.error('Error fetching active draws:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async GetWinningNumber(req, res) {
  const draw = await Draws.findByPk(req.params.drawId);
  res.json({
    bitcoinHash: draw.drawHash,
    winningNumber: draw.winningNumber,
    method: "random_5_digits_from_hash"
  });
}



}

module.exports = new MainLotareya()