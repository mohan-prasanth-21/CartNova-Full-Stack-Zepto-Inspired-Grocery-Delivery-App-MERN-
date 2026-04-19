# 🛒 CartNova — Full Stack Grocery Delivery App

<div align="center">

![CartNova](https://img.shields.io/badge/CartNova-Grocery%20Delivery-1a9e5c?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Express](https://img.shields.io/badge/Express.js-5.2.1-000000?style=for-the-badge&logo=express)

**A Zepto-inspired grocery delivery web app — built from scratch with the full MERN stack.**

[Live Demo](#) · [Report Bug](https://github.com/mohan-prasanth-21/CartNova-Full-Stack-Zepto-Inspired-Grocery-Delivery-App-MERN-.git/issues) · [GitHub](https://github.com/mohan-prasanth-21/CartNova-Full-Stack-Zepto-Inspired-Grocery-Delivery-App-MERN-.git)

</div>

---

## 📸 Screenshots

### 🏠 Home Page

![Home](screenshots/home.png)

### 🔐 Login Page

![Login](screenshots/login.png)

### 🛍️ Products Page

![Products](screenshots/products.png)

### 🛒 Cart Page

![Cart](screenshots/mycart.png)

### 💳 Checkout Page

![Checkout](screenshots/checkout.png)

### 📦 Orders Page

![Orders](screenshots/order.png)

### 📊 Admin Analytics

![Analytics](screenshots/analyticdashboard.png)

---

## ✨ Features

### 👤 User

- 🔐 Register & Login with JWT authentication
- 🔒 Password securely hashed with bcryptjs
- 🛍️ Browse 24 grocery products across 7 categories
- 🔍 Real-time search by product name
- 🎛️ Filter by category, price range; sort by price/discount/rating
- 🛒 Add to cart with quantity controls
- 💾 Cart persists across page refreshes (localStorage)
- 📦 Checkout with delivery address & payment selection
- 🏷️ Apply coupon codes (CART100 · FRESH20)
- ✅ Orders saved to MongoDB — viewable in order history
- 📋 Order history with status badges (Processing / Delivered / Cancelled)

### 👑 Admin

- 📊 Analytics dashboard with KPI cards (revenue, orders, avg order value)
- 📈 Weekly bar chart & monthly line chart for revenue
- 🍩 Sales by category donut chart
- 🏆 Top products ranked by rating (live from DB)
- 📋 Recent orders table with real MongoDB data
- 📦 Full product inventory table

---

## 🛠️ Tech Stack

| Layer                | Technology                        |
| -------------------- | --------------------------------- |
| **Frontend**         | React 18, React Router v6, Vite 4 |
| **State Management** | React Context API (Auth + Cart)   |
| **Styling**          | Pure CSS3 — no framework          |
| **Backend**          | Node.js, Express.js 5             |
| **Database**         | MongoDB + Mongoose 9              |
| **Authentication**   | JWT (jsonwebtoken) + bcryptjs     |
| **Dev Tools**        | nodemon, MongoDB Compass, Postman |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local) OR MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/mohan-prasanth-21/CartNova-Full-Stack-Zepto-Inspired-Grocery-Delivery-App-MERN-.git
cd CartNova
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
# For local MongoDB:
MONGO_URI=mongodb://127.0.0.1:27017/cartnova

# For MongoDB Atlas (production):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cartnova

JWT_SECRET=cartnova_super_secret_2024
PORT=5000
```

Seed the database (creates 24 products + admin user):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev        # development (auto-restart)
npm start          # production
```

### 3. Setup the Frontend

```bash
# Open a new terminal
cd client
npm install
npm run dev
```

### 4. Open the app

Visit 👉 **http://localhost:5173**

---

## 🔑 Default Login Credentials

| Role     | Email             | Password |
| -------- | ----------------- | -------- |
| 👑 Admin | admin@zepto.com   | admin123 |
| 👤 User  | Register yourself | —        |

---

## 📁 Project Structure

```
CartNova/
├── client/                          # React Frontend
│   └── src/
│       ├── api.js                   # Central API utility (all fetch calls)
│       ├── context/
│       │   ├── AuthContext.jsx      # JWT auth state management
│       │   └── CartContext.jsx      # Cart state + localStorage persistence
│       ├── pages/
│       │   ├── Login.jsx            # Login page
│       │   ├── Register.jsx         # Registration page
│       │   ├── Home.jsx             # Main page with banner + products
│       │   ├── Products.jsx         # Product listing with filters
│       │   ├── Cart.jsx             # Cart page
│       │   ├── Checkout.jsx         # Checkout + order placement
│       │   ├── Orders.jsx           # Order history
│       │   └── Analytics.jsx        # Admin dashboard
│       └── components/
│           ├── Header.jsx           # Top navigation bar
│           ├── BottomNav.jsx        # Mobile bottom navigation
│           └── ProductCard.jsx      # Product display card
│
└── server/                          # Node.js Backend
    ├── models/
    │   ├── userModel.js             # User schema (bcrypt passwords)
    │   ├── productModel.js          # Product schema
    │   └── orderModel.js            # Order schema
    ├── routes/
    │   ├── authRoutes.js            # POST /api/auth/login & /register
    │   ├── productRoutes.js         # GET/POST/PUT/DELETE /api/products
    │   └── orderRoutes.js           # GET/POST /api/orders
    ├── middleware/
    │   └── authMiddleware.js        # JWT protect + adminOnly guard
    ├── utils/
    │   └── generateToken.js         # JWT token generator
    ├── config/
    │   └── db.js                    # MongoDB connection
    ├── seed.js                      # Database seeder
    ├── server.js                    # Express entry point
    └── .env.example                 # Environment variable template
```

---

## 🌐 API Reference

### Auth

| Method | Endpoint             | Auth | Body                               |
| ------ | -------------------- | ---- | ---------------------------------- |
| POST   | `/api/auth/register` | None | `{ name, email, password, phone }` |
| POST   | `/api/auth/login`    | None | `{ email, password }`              |

### Products

| Method | Endpoint            | Auth  | Description                               |
| ------ | ------------------- | ----- | ----------------------------------------- |
| GET    | `/api/products`     | None  | All products (filter: `?category=Fruits`) |
| GET    | `/api/products/:id` | None  | Single product                            |
| POST   | `/api/products`     | Admin | Add product                               |
| PUT    | `/api/products/:id` | Admin | Update product                            |
| DELETE | `/api/products/:id` | Admin | Delete product                            |

### Orders

| Method | Endpoint                 | Auth  | Description         |
| ------ | ------------------------ | ----- | ------------------- |
| POST   | `/api/orders`            | User  | Place a new order   |
| GET    | `/api/orders/mine`       | User  | My order history    |
| GET    | `/api/orders`            | Admin | All orders          |
| PUT    | `/api/orders/:id/status` | Admin | Update order status |

---

## 🗄️ Database Collections

| Collection | Documents        | Description                    |
| ---------- | ---------------- | ------------------------------ |
| `users`    | Registered users | Stores hashed passwords, roles |
| `products` | 24 grocery items | Seeded via `npm run seed`      |
| `orders`   | Placed orders    | Linked to user via ObjectId    |

---

## 🚢 Deployment

| Service  | Platform                                                                               |
| -------- | -------------------------------------------------------------------------------------- |
| Frontend | [Vercel](https://vercel.com) — set root to `client/`                                   |
| Backend  | [Render](https://render.com) or [Railway](https://railway.app) — set root to `server/` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) — free M0 tier                          |

> After deploying, update the Vite proxy in `client/vite.config.js` with your deployed backend URL.

---

## 👨‍💻 Developer

**Mohan Prasanth**

- GitHub: [@mohan-prasanth-21](https://github.com/mohan-prasanth-21)
- Repository: [CartNova](https://github.com/mohan-prasanth-21/CartNova-Full-Stack-Zepto-Inspired-Grocery-Delivery-App-MERN-.git)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
Made with ❤️ by Mohan Prasanth
</div>
