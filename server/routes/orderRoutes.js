import express from 'express'
import Order from '../models/orderModel.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// POST /api/orders — place a new order
router.post('/', protect, async (req, res) => {
  const { items, address, payment, total } = req.body
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' })
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    address,
    payment,
    total,
    status: 'Processing',
  })

  res.status(201).json(order)
})

// GET /api/orders/mine — logged-in user's orders
router.get('/mine', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
})

// GET /api/orders — admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
  res.json(orders)
})

// PUT /api/orders/:id/status — admin: update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  order.status = req.body.status || order.status
  await order.save()
  res.json(order)
})

export default router
