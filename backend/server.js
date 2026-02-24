import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { supabase } from './supabaseClient.js' // Add the .js extension here!

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running with Modern Import! 🚀')
})

// test route
app.get('/test', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*')

  if (error) return res.status(400).json(error)
  res.json(data)
})

// Ensure your .env has PORT=3000 or use 3001 as fallback
const PORT = process.env.PORT || 3001; 

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
