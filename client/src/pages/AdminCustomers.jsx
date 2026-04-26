import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import './Analytics.css'

const NAV_ITEMS = [
  ['📊', 'Analytics',  '/admin'],
  ['📦', 'Orders',     '/admin/orders'],
  ['🛍️', 'Products',   '/admin/products'],
  ['👥', 'Customers',  '/admin/customers'],
  ['⚙️', 'Settings',   '/admin/settings'],
]

export default function AdminCustomers() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [customers,   setCustomers]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState(null)
  const [orders,      setOrders]      = useState([])
  const [deleting,    setDeleting]    = useState(null)

  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    api.getUsers().then(d => { if (Array.isArray(d)) setCustomers(d); setLoading(false) })
    api.getAllOrders().then(d => { if (Array.isArray(d)) setOrders(d) })
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    setDeleting(id)
    await api.deleteUser(id)
    setCustomers(prev => prev.filter(c => c._id !== id))
    if (selected?._id === id) setSelected(null)
    setDeleting(null)
  }

  const getUserOrders  = (uid) => orders.filter(o => o.user === uid || o.user?._id === uid)
  const getUserRevenue = (uid) => getUserOrders(uid).reduce((s, o) => s + (o.total || 0), 0)

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const totalCustomers = customers.length
  const adminCount     = customers.filter(c => c.role === 'admin').length
  const userCount      = customers.filter(c => c.role === 'user').length

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
              <h1>👥 Customers</h1>
              <p className="at-sub">{totalCustomers} registered users</p>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Total Users', value: totalCustomers, icon: '👥', bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'Customers',   value: userCount,      icon: '🙍', bg: '#f0fdf4', color: '#15803d' },
            { label: 'Admins',      value: adminCount,     icon: '👑', bg: '#fef3c7', color: '#92400e' },
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

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name, email or phone..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        {/* Customer Detail Modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>👤 Customer Details</h3>
                <button onClick={() => setSelected(null)}
                  style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>

              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ width: 52, height: 52, background: '#1a9e5c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {selected.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, margin: 0 }}>{selected.name}</p>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 4px' }}>{selected.email}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: selected.role === 'admin' ? '#fef3c7' : '#dcfce7', color: selected.role === 'admin' ? '#92400e' : '#15803d' }}>
                    {selected.role?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  ['📱 Phone',   selected.phone || 'Not provided'],
                  ['📅 Joined',  new Date(selected.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })],
                  ['📦 Orders',  getUserOrders(selected._id).length],
                  ['💰 Revenue', `₹${getUserRevenue(selected._id).toLocaleString('en-IN')}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 3px' }}>{label}</p>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              {getUserOrders(selected._id).length > 0 && (
                <>
                  <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8, letterSpacing: 0.4 }}>RECENT ORDERS</p>
                  {getUserOrders(selected._id).slice(0, 3).map(o => (
                    <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#1a9e5c', fontWeight: 600 }}>#{o._id?.slice(-6).toUpperCase()}</span>
                      <span>₹{o.total}</span>
                      <span style={{ color: '#64748b' }}>{o.status}</span>
                    </div>
                  ))}
                </>
              )}

              {selected.role !== 'admin' && (
                <button
                  onClick={() => handleDelete(selected._id)}
                  disabled={deleting === selected._id}
                  style={{ width: '100%', marginTop: 20, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: 11, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {deleting === selected._id ? 'Deleting...' : '🗑️ Delete Customer'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="chart-card full">
          <div className="chart-header">
            <h3>All Customers</h3>
            <span className="chart-badge">{filtered.length} users</span>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading...</p>
          ) : (
            <div className="table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>User</th><th>Email</th><th>Phone</th><th>Role</th>
                    <th>Joined</th><th>Orders</th><th>Revenue</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, background: '#1a9e5c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {c.avatar}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{c.email}</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{c.phone || '—'}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: c.role === 'admin' ? '#fef3c7' : '#dcfce7', color: c.role === 'admin' ? '#92400e' : '#15803d' }}>
                          {c.role?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 600 }}>{getUserOrders(c._id).length}</td>
                      <td style={{ fontWeight: 700, color: '#1a9e5c' }}>₹{getUserRevenue(c._id).toLocaleString('en-IN')}</td>
                      <td>
                        <button onClick={() => setSelected(c)}
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