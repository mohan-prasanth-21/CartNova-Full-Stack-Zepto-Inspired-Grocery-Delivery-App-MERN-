import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import './Analytics.css'

/* ─── Sub-components ─── */

function BarChart({ data, color = '#1a9e5c' }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="bar-label">{d.label}</span>
          <span className="bar-val">
            ₹{d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'k' : d.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data, color = '#1a9e5c' }) {
  const W = 400, H = 120
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (W - 40) + 20,
    y: H - ((d.value - min) / (max - min || 1)) * (H - 30) - 10,
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`
  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="line-svg">
        <defs>
          <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0"   />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lc-grad)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4"
                  fill={color} stroke="white" strokeWidth="2" />
        ))}
      </svg>
      <div className="line-labels">
        {data.map((d, i) => <span key={i}>{d.label}</span>)}
      </div>
    </div>
  )
}

function DonutChart({ segments }) {
  let cumulative = 0
  const total = segments.reduce((s, g) => s + g.value, 0)
  const R = 36, C = 2 * Math.PI * R
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg">
        {segments.map((seg, i) => {
          const pct    = seg.value / total
          const dash   = pct * C
          const gap    = C - dash
          const rotate = (cumulative / total) * 360 - 90
          cumulative  += seg.value
          return (
            <circle key={i} cx="50" cy="50" r={R}
              fill="none" stroke={seg.color} strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`} strokeLinecap="butt"
              transform={`rotate(${rotate} 50 50)`} />
          )
        })}
        <text x="50" y="47" textAnchor="middle" fontSize="10"
              fontWeight="700" fill="#111">{segments[0]?.pct}%</text>
        <text x="50" y="57" textAnchor="middle" fontSize="7"
              fill="#666">Top cat</text>
      </svg>
      <div className="donut-legend">
        {segments.map((s, i) => (
          <div key={i} className="donut-item">
            <span className="dl-dot" style={{ background: s.color }} />
            <span className="dl-label">{s.label}</span>
            <span className="dl-val">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Static data ─── */

const revenueData = [
  { label: 'Mon', value: 18400 }, { label: 'Tue', value: 23200 },
  { label: 'Wed', value: 19800 }, { label: 'Thu', value: 29600 },
  { label: 'Fri', value: 34200 }, { label: 'Sat', value: 41800 },
  { label: 'Sun', value: 38500 },
]
const monthlyData = [
  { label: 'Jan', value: 280000 }, { label: 'Feb', value: 310000 },
  { label: 'Mar', value: 295000 }, { label: 'Apr', value: 380000 },
  { label: 'May', value: 420000 }, { label: 'Jun', value: 395000 },
]
const catSegments = [
  { label: 'Fruits',    value: 28, color: '#1a9e5c', pct: 28 },
  { label: 'Dairy',     value: 22, color: '#3b82f6', pct: 22 },
  { label: 'Snacks',    value: 20, color: '#f59e0b', pct: 20 },
  { label: 'Beverages', value: 15, color: '#8b5cf6', pct: 15 },
  { label: 'Others',    value: 15, color: '#ef4444', pct: 15 },
]

const RANK_COLORS = ['#f59e0b', '#9ca3af', '#cd7f32', '#555', '#555', '#555']

/* ─── Main component ─── */

export default function Analytics() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ✅ ALL hooks declared at top level, in consistent order
  const [range,       setRange]       = useState('week')
  const [orders,      setOrders]      = useState([])
  const [products,    setProducts]    = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    api.getAllOrders()
      .then(d => { if (Array.isArray(d)) setOrders(d) })
      .catch(() => {})

    fetch('/api/products')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setProducts(d) })
      .catch(() => {})
  }, [])

  /* Derived values */
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const topProducts  = [...products].sort((a, b) => b.rating - a.rating).slice(0, 6)
  const recentOrders = orders.slice(0, 6)

  const KPIS = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + 'k' : totalRevenue}`,
      delta: '+18%', icon: '💰', color: '#1a9e5c', bg: '#e8f8f0',
    },
    {
      label: 'Total Orders',
      value: orders.length.toLocaleString(),
      delta: '+12%', icon: '📦', color: '#3b82f6', bg: '#eff6ff',
    },
    {
      label: 'Active Users',
      value: '8,430',
      delta: '+24%', icon: '👥', color: '#8b5cf6', bg: '#f5f3ff',
    },
    {
      label: 'Avg Order Value',
      value: orders.length ? `₹${Math.round(totalRevenue / orders.length)}` : '₹0',
      delta: '+5%', icon: '🛒', color: '#f59e0b', bg: '#fffbeb',
    },
    {
      label: 'Avg Delivery',
      value: '8.4 mins',
      delta: '-12%', icon: '⚡', color: '#ef4444', bg: '#fef2f2',
    },
    {
      label: 'Customer Rating',
      value: '4.7 ★',
      delta: '+0.2', icon: '⭐', color: '#f59e0b', bg: '#fffbeb',
    },
  ]

  /* Helpers */
  const closeSidebar = () => setSidebarOpen(false)

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue',   `₹${totalRevenue}`],
      ['Total Orders',    orders.length],
      ['Avg Order Value', orders.length ? `₹${Math.round(totalRevenue / orders.length)}` : '₹0'],
      ['Products',        products.length],
      [],
      ['Order ID', 'Items', 'City', 'Total', 'Status', 'Date'],
      ...orders.map(o => [
        `#${o._id?.slice(-8).toUpperCase()}`,
        o.items?.length,
        o.address?.city || '—',
        `₹${o.total}`,
        o.status,
        new Date(o.createdAt).toLocaleDateString('en-IN'),
      ]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `cartnova-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ─── Render ─── */
  return (
    <div className="analytics-pg">

      {/* Overlay — tap outside to close sidebar */}
      {sidebarOpen && (
        <div className="overlay" onClick={closeSidebar} />
      )}

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
          {[
            ['📊', 'Analytics', '/admin'],
            ['📦', 'Orders',    '/admin/orders'],
            ['🛍️', 'Products',  '/admin/products'],
            ['👥', 'Customers', '/admin/customers'],
            ['⚙️', 'Settings',  '/admin/settings'],
          ].map(([icon, label, path]) => (
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

        <button className="admin-logout"
          onClick={() => { logout(); navigate('/') }}>
          🚪 Logout
        </button>
        <button className="admin-store-btn" onClick={() => navigate('/home')}>
          🛒 View Store
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-main">

        {/* Top Bar */}
        <div className="admin-topbar">
          {/* Left side: hamburger + title */}
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <h1>Analytics Dashboard</h1>
              <p className="at-sub">
                Welcome back, {user?.name} 👋 Here's what's happening today.
              </p>
            </div>
          </div>

          {/* Right side: range tabs + export */}
          <div className="at-actions">
            <div className="range-tabs">
              {['week', 'month', 'year'].map(r => (
                <button
                  key={r}
                  className={`rtab ${range === r ? 'active' : ''}`}
                  onClick={() => setRange(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <button className="export-btn" onClick={handleExport}>
              ⬇️ Export
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid">
          {KPIS.map(k => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>
                {k.icon}
              </div>
              <div className="kpi-info">
                <p className="kpi-val">{k.value}</p>
                <p className="kpi-label">{k.label}</p>
              </div>
              <span className={`kpi-delta ${k.delta.startsWith('+') ? 'up' : 'dn'}`}>
                {k.delta}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Row 1 — Revenue + Category */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Overview</h3>
              <span className="chart-badge">
                {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'This Year'}
              </span>
            </div>
            {range === 'week'
              ? <BarChart  data={revenueData} color="#1a9e5c" />
              : <LineChart data={monthlyData} color="#1a9e5c" />
            }
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Sales by Category</h3>
            </div>
            <DonutChart segments={catSegments} />
          </div>
        </div>

        {/* Charts Row 2 — Top Products + Recent Orders */}
        <div className="charts-row">

          {/* Top Products */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>🏆 Top Products</h3>
            </div>
            <div className="top-products">
              {topProducts.map((p, i) => (
                <div className="tp-row" key={p._id || p.id}>
                  <span className="tp-rank" style={{ color: RANK_COLORS[i] }}>
                    #{i + 1}
                  </span>
                  <img
                    src={p.image} alt={p.name} className="tp-img"
                    onError={e =>
                      (e.target.src = `https://placehold.co/36x36/e8f8f0/1a9e5c?text=${p.name[0]}`)
                    }
                  />
                  <div className="tp-info">
                    <p className="tp-name">{p.name}</p>
                    <p className="tp-cat">{p.category}</p>
                  </div>
                  <div className="tp-right">
                    <p className="tp-price">₹{p.price}</p>
                    <p className="tp-rating">⭐ {p.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>📋 Recent Orders</h3>
              <span className="chart-badge">{recentOrders.length} orders</span>
            </div>

            {recentOrders.length === 0 ? (
              <div className="no-orders-analytics">
                <p>No orders placed yet.</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Orders will appear here after checkout.
                </p>
              </div>
            ) : (
              /* ✅ table-wrap enables horizontal scroll on mobile */
              <div className="table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Items</th>
                      <th>City</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o._id}>
                        <td className="ot-id">
                          #{o._id?.slice(-6).toUpperCase()}
                        </td>
                        <td>{o.items?.length} items</td>
                        <td className="ot-addr">{o.address?.city || '—'}</td>
                        <td><b>₹{o.total}</b></td>
                        <td>
                          <span className={`ot-status ${o.status?.toLowerCase()}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Full-width Inventory */}
        <div className="chart-card full">
          <div className="chart-header">
            <h3>📦 Product Inventory</h3>
            <span className="chart-badge">{products.length} products</span>
          </div>

          {/* ✅ table-wrap enables horizontal scroll on mobile */}
          <div className="table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>MRP</th>
                  <th>Discount</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p._id || p.id}>
                    <td className="inv-idx">{i + 1}</td>
                    <td>
                      <div className="inv-prod">
                        <img
                          src={p.image} alt={p.name}
                          onError={e =>
                            (e.target.src = `https://placehold.co/32x32/e8f8f0/1a9e5c?text=${p.name[0]}`)
                          }
                        />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="inv-cat">{p.category}</span></td>
                    <td><b>₹{p.price}</b></td>
                    <td className="inv-mrp">₹{p.mrp}</td>
                    <td>
                      {p.discount > 0
                        ? <span className="inv-disc">{p.discount}%</span>
                        : '—'
                      }
                    </td>
                    <td>⭐ {p.rating}</td>
                    <td>
                      <span className="inv-status">
                        {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}