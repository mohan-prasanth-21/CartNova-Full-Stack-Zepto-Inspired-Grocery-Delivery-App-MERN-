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

router.get('/seed-products', async (req, res) => {
  try {
    const Product = (await import('../models/productModel.js')).default
    await Product.deleteMany()
    await Product.insertMany([
      { name: 'Apple', price: 40, category: 'Fruits', image: 'https://placehold.co/200', stock: 100, description: 'Fresh apples' },
      { name: 'Banana', price: 20, category: 'Fruits', image: 'https://placehold.co/200', stock: 150, description: 'Fresh bananas' },
      { name: 'Milk', price: 60, category: 'Dairy', image: 'https://placehold.co/200', stock: 80, description: 'Fresh milk 1L' },
      { name: 'Bread', price: 35, category: 'Bakery', image: 'https://placehold.co/200', stock: 60, description: 'Fresh bread' },
      { name: 'Chips', price: 30, category: 'Snacks', image: 'https://placehold.co/200', stock: 200, description: 'Potato chips' },
    ])
    res.json({ message: 'Products seeded successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
export default router