import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import './Analytics.css'

const STATUS_COLORS = {
  Processing: { bg: '#fef3c7', color: '#92400e' },
  Delivered:  { bg: '#dcfce7', color: '#15803d' },
  Cancelled:  { bg: '#fee2e2', color: '#b91c1c' },
  Shipped:    { bg: '#dbeafe', color: '#1d4ed8' },
}

const NAV_ITEMS = [
  ['📊', 'Analytics',  '/admin'],
  ['📦', 'Orders',     '/admin/orders'],
  ['🛍️', 'Products',   '/admin/products'],
  ['👥', 'Customers',  '/admin/customers'],
  ['⚙️', 'Settings',   '/admin/settings'],
]

export default function AdminOrders() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [selected,      setSelected]      = useState(null)
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [search,        setSearch]        = useState('')
  const [updating,      setUpdating]      = useState(null)

  const closeSidebar = () => setSidebarOpen(false)

  const getToken    = () => { try { return JSON.parse(localStorage.getItem('cartnova_user'))?.token || '' } catch { return '' } }
  const authHeader  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` })

  useEffect(() => {
    api.getAllOrders().then(d => {
      if (Array.isArray(d)) setOrders(d)
      setLoading(false)
    })
  }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    const res  = await fetch(`/api/orders/${orderId}/status`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ status }) })
    const data = await res.json()
    if (data._id) {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o))
      if (selected?._id === orderId) setSelected(prev => ({ ...prev, status }))
    }
    setUpdating(null)
  }

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch = o._id?.toLowerCase().includes(search.toLowerCase()) ||
                        o.address?.city?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const processing   = orders.filter(o => o.status === 'Processing').length
  const delivered    = orders.filter(o => o.status === 'Delivered').length

  return (
    <div className="analytics-pg">

      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && <div className="overlay show" onClick={closeSidebar} />}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={closeSidebar}>✕</button>

        <div className="admin-brand">
          <div className="ab-logo">C</div>
          <div>
            <p className="ab-title">CartNova</p>
            <p className="ab-sub">Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(([icon, label, path]) => (
            <button
              key={label}
              className={`anav-btn ${window.location.pathname === path ? 'active' : ''}`}
              onClick={() => { navigate(path); closeSidebar() }}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        <div className="admin-user">
          <div className="au-av">{user?.avatar}</div>
          <div>
            <p className="au-name">{user?.name}</p>
            <p className="au-role">Administrator</p>
          </div>
        </div>
        <button className="admin-logout"    onClick={() => { logout(); navigate('/') }}>🚪 Logout</button>
        <button className="admin-store-btn" onClick={() => navigate('/home')}>🛒 View Store</button>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">

        {/* Top bar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1>📦 Orders</h1>
              <p className="at-sub">{orders.length} total orders · ₹{totalRevenue.toLocaleString('en-IN')} revenue</p>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total Orders', value: orders.length, icon: '📦', bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'Processing',   value: processing,    icon: '🔄', bg: '#fef3c7', color: '#92400e' },
            { label: 'Delivered',    value: delivered,     icon: '✅', bg: '#dcfce7', color: '#15803d' },
          ].map(k => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
              <div className="kpi-info">
                <p className="kpi-val">{k.value}</p>
                <p className="kpi-label">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by order ID or city..."
            style={{ flex: 1, minWidth: 180, padding: '9px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}
          >
            <option value="all">All Status</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Order Detail Modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Order #{selected._id?.slice(-8).toUpperCase()}</h3>
                <button onClick={() => setSelected(null)}
                  style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>

              {/* Status update */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>UPDATE STATUS</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected._id, s)}
                      disabled={updating === selected._id || selected.status === s}
                      style={{
                        padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        background: selected.status === s ? STATUS_COLORS[s]?.bg : '#f1f5f9',
                        color: selected.status === s ? STATUS_COLORS[s]?.color : '#374151',
                        opacity: updating === selected._id ? 0.6 : 1,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>📍 DELIVERY ADDRESS</p>
                <p style={{ fontSize: 13 }}>{selected.address?.name} · {selected.address?.phone}</p>
                <p style={{ fontSize: 13, color: '#374151' }}>
                  {selected.address?.flat}, {selected.address?.area}, {selected.address?.city} — {selected.address?.pincode}
                </p>
              </div>

              {/* Items */}
              <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>🛒 ITEMS</p>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <img src={item.image} alt={item.name}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    onError={e => e.target.src = `https://placehold.co/40x40/e8f8f0/1a9e5c?text=${item.name[0]}`}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>x{item.qty} × ₹{item.price}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>₹{item.price * item.qty}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, padding: '10px 0', borderTop: '2px solid #1a9e5c' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: '#1a9e5c', fontSize: 16 }}>₹{selected.total}</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Payment: {selected.payment?.toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="chart-card full">
          <div className="chart-header">
            <h3>All Orders</h3>
            <span className="chart-badge">{filtered.length} orders</span>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading orders...</p>
          ) : filtered.length === 0 ? (
            <div className="no-orders-analytics"><p>No orders found.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th><th>Date</th><th>Items</th><th>City</th>
                    <th>Total</th><th>Payment</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o._id}>
                      <td className="ot-id">#{o._id?.slice(-8).toUpperCase()}</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>{o.items?.length} items</td>
                      <td className="ot-addr">{o.address?.city || '—'}</td>
                      <td><b>₹{o.total}</b></td>
                      <td style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>{o.payment}</td>
                      <td>
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 600,
                          background: STATUS_COLORS[o.status]?.bg || '#f1f5f9',
                          color: STATUS_COLORS[o.status]?.color || '#374151',
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setSelected(o)}
                          style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}