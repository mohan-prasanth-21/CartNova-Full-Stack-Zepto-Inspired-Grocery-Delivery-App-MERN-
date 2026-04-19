import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      String,
  image:     String,
  price:     Number,
  mrp:       Number,
  weight:    String,
  qty:       Number,
})

const addressSchema = new mongoose.Schema({
  name:     String,
  phone:    String,
  flat:     String,
  area:     String,
  landmark: String,
  city:     String,
  pincode:  String,
  type:     String,
})

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:   [orderItemSchema],
  address: addressSchema,
  payment: { type: String, default: 'upi' },
  total:   { type: Number, required: true },
  status:  { type: String, enum: ['Processing', 'Delivered', 'Cancelled'], default: 'Processing' },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
