import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './BottomNav.css'

const tabs = [
  { path: '/home', icon: '🏠', label: 'Home' },
  { path: '/products', icon: '📦', label: 'Shop' },
  { path: '/cart', icon: '🛒', label: 'Cart', badge: true },
  { path: '/orders', icon: '📋', label: 'Orders' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { totalItems } = useCart()
  return (
    <nav className="bnav">
      {tabs.map(t => (
        <button key={t.path} className={`bnav-item ${pathname === t.path ? 'active' : ''}`} onClick={() => navigate(t.path)}>
          <span className="bnav-icon-wrap">
            {t.icon}
            {t.badge && totalItems > 0 && <span className="bnav-dot">{totalItems}</span>}
          </span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
