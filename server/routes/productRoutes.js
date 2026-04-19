import express from 'express'
import Product from '../models/productModel.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/products — all products (with optional category filter)
router.get('/', async (req, res) => {
  const filter = {}
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category
  }
  const products = await Product.find(filter)
  res.json(products)
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

// POST /api/products — admin only: add product
router.post('/', protect, adminOnly, async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

// PUT /api/products/:id — admin only: update product
router.put('/:id', protect, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

// DELETE /api/products/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json({ message: 'Product removed' })
})

export default router
