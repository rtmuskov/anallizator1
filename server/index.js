require('dotenv').config()
const express = require('express')
const router = require('./src/routes/index')
const sequelize = require('./db')
const models = require('./src/models/models')
const cors = require('cors')
const path = require('path')

const PORT = process.env.PORT
const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', router)

const start = async () => {
    try {
        await sequelize.authenticate()
        console.log('Соединение с БД установлено.')
        await sequelize.sync({ alter: true })

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start() 