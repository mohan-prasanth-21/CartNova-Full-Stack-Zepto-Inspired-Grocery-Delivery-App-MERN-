import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Header.css'

export default function Header({ search, setSearch }) {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = (path) => { navigate(path); setMenuOpen(false) }

  return (
    <header className="header">
      <div className="hdr-inner">
        <div className="hdr-brand" onClick={() => nav('/home')}>
          <div className="hdr-logo">C</div>
          <span>CartNova</span>
        </div>

        <div className="hdr-loc" onClick={() => {}}>
          <span>📍</span>
          <div>
            <p className="loc-top">Deliver to</p>
            <p className="loc-bot">Mumbai <span>▾</span></p>
          </div>
        </div>

        <div className="hdr-search">
          <span>🔍</span>
          <input placeholder="Search groceries, snacks, drinks..."
            value={search || ''} onChange={e => setSearch && setSearch(e.target.value)} />
          {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
        </div>

        <div className="hdr-actions">
          {user?.role === 'admin' && (
            <button className="admin-pill" onClick={() => nav('/admin')}>📊 Analytics</button>
          )}
          <button className="hdr-orders" onClick={() => nav('/orders')}>📦 Orders</button>
          <button className="hdr-cart" onClick={() => nav('/cart')}>
            🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          <div className="hdr-user" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="user-av">{user?.avatar || 'U'}</div>
            {menuOpen && (
              <div className="user-dropdown">
                <div className="ud-info">
                  <p className="ud-name">{user?.name}</p>
                  <p className="ud-email">{user?.email}</p>
                  {user?.role === 'admin' && <span className="ud-badge">Admin</span>}
                </div>
                <hr/>
                <button onClick={() => nav('/orders')}>📦 My Orders</button>
                {user?.role === 'admin' && <button onClick={() => nav('/admin')}>📊 Analytics</button>}
                <button className="logout-btn" onClick={() => { logout(); navigate('/') }}>🚪 Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
