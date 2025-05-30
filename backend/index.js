require('dotenv').config()
const express = require('express')
const router = require('./src/routes/index')
const sequelize = require('./db')
const models = require('./src/models/models')
const cors = require('cors')
const path = require('path')


const PORT = process.env.PORT
const app = express()


app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', router)
app.use('/api/thimble', router);

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()