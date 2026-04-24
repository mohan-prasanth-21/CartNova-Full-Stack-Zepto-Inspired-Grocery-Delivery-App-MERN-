import express from 'express'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

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


// GET all users - admin only
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE user - admin only
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
export default router