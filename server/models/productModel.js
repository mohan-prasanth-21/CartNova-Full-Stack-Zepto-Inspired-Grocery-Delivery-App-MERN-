import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  category: { type: String, required: true },
  price:    { type: Number, required: true },
  mrp:      { type: Number, required: true },
  weight:   { type: String, default: '' },
  discount: { type: Number, default: 0 },
  rating:   { type: Number, default: 4.0 },
  image:    { type: String, default: '' },
  badge:    { type: String, default: '' },
  inStock:  { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)
