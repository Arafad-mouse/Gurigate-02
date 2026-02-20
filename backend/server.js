const express = require('express')
const cors = require('cors')
require('dotenv').config()

const supabase = require('./supabaseClient')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running')
})

// test route
app.get('/test', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*')

  if (error) return res.status(400).json(error)
  res.json(data)
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})