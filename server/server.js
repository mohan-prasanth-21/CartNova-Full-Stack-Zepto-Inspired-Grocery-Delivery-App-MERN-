import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes    from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes   from './routes/orderRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({
  origin: "https://cartnova-app-client.vercel.app",
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)

// Health check
app.get('/', (req, res) => res.send('CartNova API running 🚀'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
