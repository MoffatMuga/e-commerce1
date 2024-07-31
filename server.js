const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { notFound, errorHandler } = require('./middlewares/errorHandler')
const app = express()
require('dotenv').config()
const authRouter = require('./routes/authRoute')



const PORT =  8000

const URI = process.env.MONGO_URL




app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api', authRouter)
app.use(notFound)
app.use(errorHandler)

const startServer = async () => {
    try {
        await mongoose.connect(URI)
        console.log('database connected successfully')

        app.listen(PORT, () => {
            console.log(`server running on PORT ${PORT}`)
        })

    } catch (error) {
        console.log('connection aborted', error)
        process.exit(1)
    }
}

startServer()

