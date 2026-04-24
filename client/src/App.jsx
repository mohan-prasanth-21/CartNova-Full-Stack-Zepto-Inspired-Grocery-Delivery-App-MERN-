import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminCustomers from './pages/AdminCustomers'
import AdminSettings from './pages/AdminSettings'




function Guard({ children, adminOnly }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/"         element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/home" replace /> : <Register />} />
      <Route path="/home"     element={<Guard><Home /></Guard>} />
      <Route path="/products" element={<Guard><Products /></Guard>} />
      <Route path="/cart"     element={<Guard><Cart /></Guard>} />
      <Route path="/checkout" element={<Guard><Checkout /></Guard>} />
      <Route path="/orders"   element={<Guard><Orders /></Guard>} />
      <Route path="/admin"    element={<Guard adminOnly><Analytics /></Guard>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
      <Route path="/admin/products" element={<Guard adminOnly><AdminProducts /></Guard>} />
      <Route path="/admin/orders"   element={<Guard adminOnly><AdminOrders /></Guard>} />
      <Route path="/admin/customers" element={<Guard adminOnly><AdminCustomers /></Guard>} />
      <Route path="/admin/settings"  element={<Guard adminOnly><AdminSettings /></Guard>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
