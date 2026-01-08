import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import summarizeRoutes from './routes/summarize.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/summarize',  summarizeRoutes)

app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

export default app
