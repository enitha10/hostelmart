const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'HostelMart backend is running!' })
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/listings', require('./routes/listings'))
app.use('/api/notifications', require('./routes/notification'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!')
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch(err => console.log('MongoDB error:', err))