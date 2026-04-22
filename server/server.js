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
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (e) {
    res.status(500).json({ message: "DB connection failed" })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.get('/', (req, res) => res.send('CartNova API running 🚀'))

export default app