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

router.get('/seed-100', async (req, res) => {
  try {
    const Product = (await import('../models/productModel.js')).default
    await Product.deleteMany()
    await Product.insertMany([
      // FRUITS
      { name: 'Apple', category: 'Fruits', price: 40, mrp: 50, weight: '1kg', discount: 20, rating: 4.5, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300' },
      { name: 'Banana', category: 'Fruits', price: 20, mrp: 25, weight: '500g', discount: 20, rating: 4.3, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300' },
      { name: 'Mango', category: 'Fruits', price: 80, mrp: 100, weight: '1kg', discount: 20, rating: 4.8, badge: 'Seasonal', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300' },
      { name: 'Orange', category: 'Fruits', price: 60, mrp: 70, weight: '1kg', discount: 14, rating: 4.4, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300' },
      { name: 'Grapes', category: 'Fruits', price: 70, mrp: 90, weight: '500g', discount: 22, rating: 4.5, image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300' },
      { name: 'Watermelon', category: 'Fruits', price: 50, mrp: 60, weight: '2kg', discount: 17, rating: 4.6, badge: 'Seasonal', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' },
      { name: 'Strawberry', category: 'Fruits', price: 120, mrp: 150, weight: '250g', discount: 20, rating: 4.7, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300' },
      { name: 'Pineapple', category: 'Fruits', price: 60, mrp: 75, weight: '1 piece', discount: 20, rating: 4.3, image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300' },
      { name: 'Papaya', category: 'Fruits', price: 45, mrp: 55, weight: '1kg', discount: 18, rating: 4.2, image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=300' },
      { name: 'Pomegranate', category: 'Fruits', price: 90, mrp: 110, weight: '500g', discount: 18, rating: 4.6, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300' },
      { name: 'Kiwi', category: 'Fruits', price: 100, mrp: 130, weight: '4 pcs', discount: 23, rating: 4.5, image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=300' },
      { name: 'Guava', category: 'Fruits', price: 35, mrp: 45, weight: '500g', discount: 22, rating: 4.1, image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=300' },
      { name: 'Pear', category: 'Fruits', price: 80, mrp: 95, weight: '4 pcs', discount: 16, rating: 4.3, image: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=300' },
      { name: 'Lemon', category: 'Fruits', price: 30, mrp: 40, weight: '6 pcs', discount: 25, rating: 4.4, image: 'https://images.unsplash.com/photo-1582087406120-5a6b822ad2d7?w=300' },
      { name: 'Coconut', category: 'Fruits', price: 40, mrp: 50, weight: '1 piece', discount: 20, rating: 4.5, image: 'https://images.unsplash.com/photo-1522004630716-8a18ca06ee2a?w=300' },

      // VEGETABLES
      { name: 'Tomato', category: 'Vegetables', price: 30, mrp: 40, weight: '500g', discount: 25, rating: 4.3, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=300' },
      { name: 'Onion', category: 'Vegetables', price: 25, mrp: 35, weight: '1kg', discount: 29, rating: 4.2, image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=300' },
      { name: 'Potato', category: 'Vegetables', price: 20, mrp: 30, weight: '1kg', discount: 33, rating: 4.4, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300' },
      { name: 'Broccoli', category: 'Vegetables', price: 50, mrp: 65, weight: '500g', discount: 23, rating: 4.5, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=300' },
      { name: 'Carrot', category: 'Vegetables', price: 35, mrp: 45, weight: '500g', discount: 22, rating: 4.4, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300' },
      { name: 'Spinach', category: 'Vegetables', price: 25, mrp: 35, weight: '250g', discount: 29, rating: 4.3, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300' },
      { name: 'Capsicum', category: 'Vegetables', price: 40, mrp: 55, weight: '3 pcs', discount: 27, rating: 4.4, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300' },
      { name: 'Cauliflower', category: 'Vegetables', price: 40, mrp: 50, weight: '1 piece', discount: 20, rating: 4.2, image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=300' },
      { name: 'Cabbage', category: 'Vegetables', price: 30, mrp: 40, weight: '1 piece', discount: 25, rating: 4.1, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300' },
      { name: 'Peas', category: 'Vegetables', price: 45, mrp: 60, weight: '500g', discount: 25, rating: 4.5, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300' },
      { name: 'Cucumber', category: 'Vegetables', price: 25, mrp: 35, weight: '3 pcs', discount: 29, rating: 4.3, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300' },
      { name: 'Bitter Gourd', category: 'Vegetables', price: 30, mrp: 40, weight: '500g', discount: 25, rating: 4.0, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1566842600175-97dca489844f?w=300' },
      { name: 'Garlic', category: 'Vegetables', price: 40, mrp: 55, weight: '250g', discount: 27, rating: 4.4, image: 'https://images.unsplash.com/photo-1501420193116-f5735e55a73c?w=300' },
      { name: 'Ginger', category: 'Vegetables', price: 35, mrp: 50, weight: '250g', discount: 30, rating: 4.3, image: 'https://images.unsplash.com/photo-1598518619776-eae3f8a34eac?w=300' },
      { name: 'Green Chilli', category: 'Vegetables', price: 20, mrp: 30, weight: '100g', discount: 33, rating: 4.2, image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=300' },

      // DAIRY
      { name: 'Full Cream Milk', category: 'Dairy', price: 60, mrp: 65, weight: '1L', discount: 8, rating: 4.6, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300' },
      { name: 'Toned Milk', category: 'Dairy', price: 50, mrp: 58, weight: '1L', discount: 14, rating: 4.4, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300' },
      { name: 'Paneer', category: 'Dairy', price: 80, mrp: 95, weight: '200g', discount: 16, rating: 4.7, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300' },
      { name: 'Curd', category: 'Dairy', price: 45, mrp: 55, weight: '400g', discount: 18, rating: 4.5, image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300' },
      { name: 'Butter', category: 'Dairy', price: 55, mrp: 65, weight: '100g', discount: 15, rating: 4.6, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300' },
      { name: 'Cheese Slices', category: 'Dairy', price: 90, mrp: 110, weight: '200g', discount: 18, rating: 4.5, image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=300' },
      { name: 'Ghee', category: 'Dairy', price: 150, mrp: 180, weight: '500ml', discount: 17, rating: 4.8, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1631653966851-a8485fbd0a9d?w=300' },
      { name: 'Lassi', category: 'Dairy', price: 40, mrp: 50, weight: '200ml', discount: 20, rating: 4.4, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300' },

      // SNACKS
      { name: 'Lays Classic', category: 'Snacks', price: 20, mrp: 20, weight: '73g', discount: 0, rating: 4.5, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300' },
      { name: 'Kurkure', category: 'Snacks', price: 20, mrp: 20, weight: '90g', discount: 0, rating: 4.4, image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=300' },
      { name: 'Biscuits', category: 'Snacks', price: 30, mrp: 35, weight: '200g', discount: 14, rating: 4.3, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300' },
      { name: 'Chocolate Bar', category: 'Snacks', price: 60, mrp: 70, weight: '100g', discount: 14, rating: 4.7, badge: 'Popular', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300' },
      { name: 'Popcorn', category: 'Snacks', price: 50, mrp: 60, weight: '150g', discount: 17, rating: 4.4, image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300' },
      { name: 'Namkeen Mix', category: 'Snacks', price: 40, mrp: 50, weight: '200g', discount: 20, rating: 4.3, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300' },
      { name: 'Peanuts', category: 'Snacks', price: 35, mrp: 45, weight: '250g', discount: 22, rating: 4.4, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1567892737950-30c4db37cd89?w=300' },
      { name: 'Cashews', category: 'Snacks', price: 180, mrp: 220, weight: '200g', discount: 18, rating: 4.7, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1549069071-cb21e23b6d79?w=300' },
      { name: 'Almonds', category: 'Snacks', price: 200, mrp: 250, weight: '200g', discount: 20, rating: 4.8, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1574570173583-e0c3b0f4a07e?w=300' },
      { name: 'Dark Chocolate', category: 'Snacks', price: 90, mrp: 110, weight: '80g', discount: 18, rating: 4.6, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300' },

      // BEVERAGES
      { name: 'Coca Cola', category: 'Beverages', price: 45, mrp: 50, weight: '750ml', discount: 10, rating: 4.5, badge: 'Popular', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300' },
      { name: 'Pepsi', category: 'Beverages', price: 40, mrp: 50, weight: '750ml', discount: 20, rating: 4.4, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300' },
      { name: 'Minute Maid Orange', category: 'Beverages', price: 30, mrp: 35, weight: '200ml', discount: 14, rating: 4.3, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300' },
      { name: 'Green Tea', category: 'Beverages', price: 120, mrp: 150, weight: '25 bags', discount: 20, rating: 4.6, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300' },
      { name: 'Coffee', category: 'Beverages', price: 180, mrp: 220, weight: '100g', discount: 18, rating: 4.7, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300' },
      { name: 'Mango Juice', category: 'Beverages', price: 35, mrp: 45, weight: '200ml', discount: 22, rating: 4.5, badge: 'Popular', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=300' },
      { name: 'Coconut Water', category: 'Beverages', price: 40, mrp: 50, weight: '250ml', discount: 20, rating: 4.6, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1550461716-dbf266b2a8a7?w=300' },
      { name: 'Lemonade', category: 'Beverages', price: 25, mrp: 30, weight: '200ml', discount: 17, rating: 4.3, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300' },
      { name: 'Energy Drink', category: 'Beverages', price: 80, mrp: 99, weight: '250ml', discount: 19, rating: 4.2, image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=300' },
      { name: 'Buttermilk', category: 'Beverages', price: 20, mrp: 25, weight: '200ml', discount: 20, rating: 4.4, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300' },

      // FROZEN
      { name: 'Ice Cream Vanilla', category: 'Frozen', price: 80, mrp: 95, weight: '500ml', discount: 16, rating: 4.7, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300' },
      { name: 'Ice Cream Chocolate', category: 'Frozen', price: 90, mrp: 110, weight: '500ml', discount: 18, rating: 4.8, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300' },
      { name: 'Frozen Peas', category: 'Frozen', price: 60, mrp: 75, weight: '500g', discount: 20, rating: 4.3, image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300' },
      { name: 'Frozen Corn', category: 'Frozen', price: 55, mrp: 70, weight: '500g', discount: 21, rating: 4.2, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300' },
      { name: 'Kulfi', category: 'Frozen', price: 30, mrp: 40, weight: '2 pcs', discount: 25, rating: 4.6, badge: 'Popular', image: 'https://images.unsplash.com/photo-1567206563114-c179706eaabb?w=300' },
      { name: 'Frozen Paratha', category: 'Frozen', price: 70, mrp: 85, weight: '5 pcs', discount: 18, rating: 4.4, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300' },
      { name: 'Frozen Pizza', category: 'Frozen', price: 150, mrp: 180, weight: '250g', discount: 17, rating: 4.3, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
      { name: 'Ice Lolly', category: 'Frozen', price: 20, mrp: 25, weight: '1 pc', discount: 20, rating: 4.2, image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300' },

      // BAKERY
      { name: 'White Bread', category: 'Bakery', price: 35, mrp: 40, weight: '400g', discount: 13, rating: 4.4, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' },
      { name: 'Brown Bread', category: 'Bakery', price: 40, mrp: 50, weight: '400g', discount: 20, rating: 4.5, badge: 'Healthy', image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=300' },
      { name: 'Croissant', category: 'Bakery', price: 60, mrp: 75, weight: '2 pcs', discount: 20, rating: 4.6, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300' },
      { name: 'Muffin', category: 'Bakery', price: 50, mrp: 65, weight: '2 pcs', discount: 23, rating: 4.5, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300' },
      { name: 'Cake Pastry', category: 'Bakery', price: 80, mrp: 100, weight: '1 pc', discount: 20, rating: 4.7, badge: 'Popular', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300' },
      { name: 'Donuts', category: 'Bakery', price: 70, mrp: 85, weight: '2 pcs', discount: 18, rating: 4.6, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300' },
      { name: 'Cookies', category: 'Bakery', price: 55, mrp: 70, weight: '200g', discount: 21, rating: 4.4, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300' },
      { name: 'Rusk', category: 'Bakery', price: 40, mrp: 50, weight: '200g', discount: 20, rating: 4.3, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300' },
      { name: 'Pav Buns', category: 'Bakery', price: 30, mrp: 35, weight: '6 pcs', discount: 14, rating: 4.4, badge: 'Fresh', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' },
      { name: 'Pizza Base', category: 'Bakery', price: 60, mrp: 75, weight: '2 pcs', discount: 20, rating: 4.3, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
    ])
    res.json({ message: `Products seeded successfully!` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
export default router