const {DataTypes} = require('sequelize')
const sequelize = require('../../db')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
})

const UserInfo = sequelize.define('user_info', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: true},
    age: {type: DataTypes.INTEGER, allowNull: true},
    gender: {type: DataTypes.STRING, allowNull: true},
    height: {type: DataTypes.FLOAT, allowNull: true},
})

const Measurement = sequelize.define('measurement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fatMass: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    skeletalMuscleMass: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    visceralFat: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    waterPercentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    basalMetabolicRate: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    metabolicAge: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
})

// Определение связи: один пользователь имеет одну информацию профиля
User.hasOne(UserInfo);
UserInfo.belongsTo(User);

User.hasMany(Measurement);
Measurement.belongsTo(User);

module.exports = {
    User,
    UserInfo,
    Measurement,
} 