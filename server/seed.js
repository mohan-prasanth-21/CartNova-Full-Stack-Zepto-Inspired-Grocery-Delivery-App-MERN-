import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import User from './models/userModel.js'
import Product from './models/productModel.js'

dotenv.config()

const products = [
  { name: "Amul Full Cream Milk", category: "Dairy", price: 28, mrp: 30, weight: "500ml", discount: 7, rating: 4.5, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&auto=format", badge: "Bestseller" },
  { name: "Fresh Bananas", category: "Fruits", price: 40, mrp: 50, weight: "1 kg", discount: 20, rating: 4.3, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop&auto=format", badge: "Fresh" },
  { name: "Red Tomatoes", category: "Vegetables", price: 30, mrp: 40, weight: "500g", discount: 25, rating: 4.2, image: "https://images.unsplash.com/photo-1592924357228-91206ad714a0?w=300&h=300&fit=crop&auto=format", badge: "25% Off" },
  { name: "Lay's Classic Salted", category: "Snacks", price: 20, mrp: 20, weight: "26g", discount: 0, rating: 4.6, image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Coca-Cola Can", category: "Beverages", price: 40, mrp: 45, weight: "330ml", discount: 11, rating: 4.4, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Amul Butter", category: "Dairy", price: 55, mrp: 60, weight: "100g", discount: 8, rating: 4.7, image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop&auto=format", badge: "Bestseller" },
  { name: "Royal Gala Apples", category: "Fruits", price: 120, mrp: 150, weight: "1 kg", discount: 20, rating: 4.4, image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop&auto=format", badge: "Fresh" },
  { name: "Fresh Onions", category: "Vegetables", price: 25, mrp: 30, weight: "1 kg", discount: 17, rating: 4.1, image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Britannia Bread", category: "Bakery", price: 40, mrp: 45, weight: "400g", discount: 11, rating: 4.3, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Maggi Noodles", category: "Snacks", price: 14, mrp: 14, weight: "70g", discount: 0, rating: 4.8, image: "https://images.unsplash.com/photo-1603046891726-36bfd957e0bf?w=300&h=300&fit=crop&auto=format", badge: "Bestseller" },
  { name: "Sprite Bottle", category: "Beverages", price: 38, mrp: 40, weight: "750ml", discount: 5, rating: 4.3, image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Fresh Paneer", category: "Dairy", price: 85, mrp: 100, weight: "200g", discount: 15, rating: 4.6, image: "https://images.unsplash.com/photo-1631452180519-cf68b732d5be?w=300&h=300&fit=crop&auto=format", badge: "Fresh" },
  { name: "Baby Spinach", category: "Vegetables", price: 20, mrp: 25, weight: "250g", discount: 20, rating: 4.2, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop&auto=format", badge: "Fresh" },
  { name: "Alphonso Mango", category: "Fruits", price: 80, mrp: 100, weight: "1 kg", discount: 20, rating: 4.7, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop&auto=format", badge: "Seasonal" },
  { name: "Frozen Green Peas", category: "Frozen", price: 60, mrp: 75, weight: "500g", discount: 20, rating: 4.2, image: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Oreo Cookies", category: "Snacks", price: 30, mrp: 35, weight: "120g", discount: 14, rating: 4.7, image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop&auto=format", badge: "Bestseller" },
  { name: "Tropicana Orange Juice", category: "Beverages", price: 75, mrp: 90, weight: "1L", discount: 17, rating: 4.5, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Amul Dahi (Curd)", category: "Dairy", price: 45, mrp: 50, weight: "400g", discount: 10, rating: 4.4, image: "https://images.unsplash.com/photo-1571167366136-b57e52a31f52?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Butter Croissant", category: "Bakery", price: 35, mrp: 40, weight: "80g", discount: 13, rating: 4.3, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop&auto=format", badge: "Fresh" },
  { name: "Frozen French Fries", category: "Frozen", price: 90, mrp: 110, weight: "400g", discount: 18, rating: 4.5, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Fresh Broccoli", category: "Vegetables", price: 45, mrp: 55, weight: "500g", discount: 18, rating: 4.3, image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&h=300&fit=crop&auto=format", badge: "Fresh" },
  { name: "Strawberries", category: "Fruits", price: 95, mrp: 120, weight: "250g", discount: 21, rating: 4.6, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop&auto=format", badge: "Seasonal" },
  { name: "Dark Chocolate Bar", category: "Snacks", price: 60, mrp: 70, weight: "90g", discount: 14, rating: 4.5, image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&h=300&fit=crop&auto=format", badge: "" },
  { name: "Greek Yogurt", category: "Dairy", price: 110, mrp: 130, weight: "400g", discount: 15, rating: 4.6, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop&auto=format", badge: "Healthy" },
]

const seedDB = async () => {
  await connectDB()

  // Clear existing data
  await Product.deleteMany()
  await Product.insertMany(products)
  console.log('✅ Products seeded:', products.length)

  // Create admin user if not exists
  const adminExists = await User.findOne({ email: 'admin@zepto.com' })
  if (!adminExists) {
    await User.create({
      name: 'Admin User',
      email: 'admin@zepto.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      avatar: 'A',
    })
    console.log('✅ Admin user created: admin@zepto.com / admin123')
  } else {
    console.log('ℹ️  Admin user already exists')
  }

  mongoose.connection.close()
  console.log('✅ Seeding complete!')
}

seedDB().catch(err => { console.error(err); process.exit(1) })
