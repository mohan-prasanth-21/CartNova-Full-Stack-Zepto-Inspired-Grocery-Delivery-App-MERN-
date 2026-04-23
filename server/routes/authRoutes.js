import express from 'express'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })
    const user = await User.create({
      name, email, password,
      phone: phone || '',
      role: 'user',
      avatar: name[0].toUpperCase(),
    })
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role, avatar: user.avatar,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' })
    }
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    res.json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role, avatar: user.avatar,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
router.get('/seed-admin', async (req, res) => {
  try {
    const bcrypt = (await import('bcryptjs')).default
    const exists = await User.findOne({ email: 'mp498952@gmail.com' })
    if (exists) {
      await User.deleteOne({ email: 'mp498952@gmail.com' })
    }
    const hashed = await bcrypt.hash('Therok05', 10)
    await User.create({
      name: 'Admin',
      email: 'mp498952@gmail.com',
      password: hashed,
      phone: '',
      role: 'admin',
      avatar: 'A',
    })
    res.json({ message: 'Admin created successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.get('/seed-products', async (req, res) => {
  try {
    const Product = (await import('../models/productModel.js')).default
    await Product.deleteMany()
    await Product.insertMany([
      { name: 'Apple', price: 40, mrp: 50, category: 'Fruits', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', weight: '1kg', discount: 20, badge: 'Fresh' },
      { name: 'Banana', price: 20, mrp: 25, category: 'Fruits', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', weight: '500g', discount: 10 },
      { name: 'Broccoli', price: 35, mrp: 40, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=300', weight: '500g', discount: 5 },
      { name: 'Milk', price: 60, mrp: 65, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', weight: '1L', badge: 'Best Seller' },
      { name: 'Bread', price: 35, mrp: 40, category: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300', weight: '400g' },
      { name: 'Chips', price: 30, mrp: 35, category: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', weight: '200g', badge: 'Popular' },
      { name: 'Coke', price: 45, mrp: 50, category: 'Beverages', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300', weight: '750ml' },
      { name: 'Ice Cream', price: 80, mrp: 90, category: 'Frozen', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300', weight: '500ml', badge: 'New' },
    ])
    res.json({ message: 'Products seeded with images!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
export default router