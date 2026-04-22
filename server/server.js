import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: "https://cartnova-app-client.vercel.app",
  credentials: true
}))
app.use(express.json())

// Connect DB on every request (fixes Vercel cold start)
app.use(async (req, res, next) => {
  await connectDB()
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.get('/', (req, res) => res.send('CartNova API running 🚀'))

export default app