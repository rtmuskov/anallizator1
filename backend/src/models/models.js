const sequelize = require('../../db')
const {DataTypes} = require('sequelize')

const VipLevels = sequelize.define('vipLevels', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    levelNumber: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    options: {type: DataTypes.STRING, allowNull:true},
    price: {type: DataTypes.INTEGER, allowNull: false},
})

const Users = sequelize.define('users', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: true},
    password: {type: DataTypes.STRING, allowNull: false},
    phone: {type: DataTypes.STRING, unique: true, allowNull: true},
    telegramId: {type: DataTypes.STRING, unique: true, allowNull: true},
    role: {type: DataTypes.STRING, defaultValue: 'user'},
})

const UserInfo = sequelize.define('userInfo', {
    firstName: {type: DataTypes.STRING},
    lastName: {type: DataTypes.STRING},
    middleName: {type: DataTypes.STRING},
    birthday: {type: DataTypes.STRING},
    gender: {type: DataTypes.STRING},
    address: {type: DataTypes.STRING},
    bonusBalance: {type: DataTypes.INTEGER, defaultValue: 0},
    balance: {type: DataTypes.INTEGER, defaultValue: 0},
})

const Draws = sequelize.define('draws', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    drawTime: {type: DataTypes.DATE, allowNull: false},
    status: {type: DataTypes.STRING, defaultValue: 'pending'},
    allTickets: {type: DataTypes.INTEGER, defaultValue: 0},
    soldTickets: {type: DataTypes.INTEGER, defaultValue: 0},
    drawHash: {type: DataTypes.STRING},
})

const Tickets = sequelize.define('Tickets', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    choosenNumber: {type: DataTypes.STRING, allowNull: false},
    isWinner: {type: DataTypes.BOOLEAN, defaultValue: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    convertedBonus: {type: DataTypes.BOOLEAN},
})

const Minigames = sequelize.define('minigames', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
})

const Transaction = sequelize.define('Transaction', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    currency: {type: DataTypes.STRING, allowNull: false},
})

// --- СВЯЗИ ---
UserInfo.belongsTo(Users, {foreignKey: 'userId'})
Users.hasOne(UserInfo, {foreignKey: 'userId'})

UserInfo.belongsTo(VipLevels, {foreignKey: 'vipLevel_id'})
VipLevels.hasMany(UserInfo, {foreignKey: 'vipLevel_id'})

Tickets.belongsTo(Users, {foreignKey: 'userId'})
Users.hasMany(Tickets, {foreignKey: 'userId'})

Tickets.belongsTo(Draws, {foreignKey: 'drawId'})
Draws.hasMany(Tickets, {foreignKey: 'drawId'})

Transaction.belongsTo(Users, {foreignKey: 'userId'})
Users.hasMany(Transaction, {foreignKey: 'userId'})

Transaction.belongsTo(Minigames, {foreignKey: 'minigameId'})
Minigames.hasMany(Transaction, {foreignKey: 'minigameId'})

Transaction.belongsTo(Tickets, {foreignKey: 'ticketId'})
Tickets.hasMany(Transaction, {foreignKey: 'ticketId'})

module.exports = {
    VipLevels,
    Users,
    UserInfo,
    Draws,
    Tickets,
    Minigames,
    Transaction,
}