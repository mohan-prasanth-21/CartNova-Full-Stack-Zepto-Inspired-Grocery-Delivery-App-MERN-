import express from 'express'
import Order from '../models/orderModel.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, async (req, res) => {
  try {
    const { items, address, payment, total } = req.body
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'No items in order' })
    const order = await Order.create({
      user: req.user._id, items, address, payment, total, status: 'Processing',
    })
    res.status(201).json(order)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    order.status = req.body.status || order.status
    await order.save()
    res.json(order)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

export default router