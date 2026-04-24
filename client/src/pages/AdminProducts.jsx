import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import './Analytics.css'

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Frozen', 'Bakery']

const EMPTY = { name: '', category: 'Fruits', price: '', mrp: '', weight: '', discount: 0, badge: '', image: '', inStock: true, rating: 4.0 }

export default function AdminProducts() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const loadProducts = () => {
    fetch('/api/products').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setProducts(d)
      setLoading(false)
    })
  }

  useEffect(() => { loadProducts() }, [])

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem('cartnova_user'))?.token || '' } catch { return '' }
  }

  const authHeader = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` })

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg('') }
  const openEdit = (p) => { setForm({ ...p }); setEditId(p._id); setShowForm(true); setMsg('') }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeader() })
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.mrp) { setMsg('Name, Price and MRP are required'); return }
    setSaving(true)
    const url = editId ? `/api/products/${editId}` : '/api/products'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify({ ...form, price: Number(form.price), mrp: Number(form.mrp), discount: Number(form.discount), rating: Number(form.rating) }) })
    const data = await res.json()
    if (data._id) {
      setMsg(editId ? 'Product updated!' : 'Product added!')
      loadProducts()
      setTimeout(() => { setShowForm(false); setMsg('') }, 1000)
    } else {
      setMsg(data.message || 'Error saving product')
    }
    setSaving(false)
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'all' || p.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <div className="analytics-pg">
      <aside className="admin-sidebar">
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
            ['📦', 'Orders', '/admin/orders'],
            ['🛍️', 'Products', '/admin/products'],
            ['👥', 'Customers', '/admin/customers'],
            ['⚙️', 'Settings', '/admin/settings'],
          ].map(([icon, label, path]) => (
            <button
              key={label}
              className={`anav-btn ${window.location.pathname === path ? 'active' : ''}`}
              onClick={() => navigate(path)}
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
        <button className="admin-logout" onClick={() => { logout(); navigate('/') }}>🚪 Logout</button>
        <button className="admin-store-btn" onClick={() => navigate('/home')}>🛒 View Store</button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>🛍️ Products</h1>
            <p className="at-sub">{products.length} products in inventory</p>
          </div>
          <button onClick={openAdd} style={{ background: '#1a9e5c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            + Add Product
          </button>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search products..."
            style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '90%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 800 }}>{editId ? '✏️ Edit Product' : '➕ Add Product'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['name', 'Product Name *', 'text'],
                  ['weight', 'Weight (e.g. 500g)', 'text'],
                  ['price', 'Price (₹) *', 'number'],
                  ['mrp', 'MRP (₹) *', 'number'],
                  ['discount', 'Discount (%)', 'number'],
                  ['rating', 'Rating (0-5)', 'number'],
                ].map(([key, label, type]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginTop: 4, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginTop: 4 }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Badge</label>
                  <select value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginTop: 4 }}>
                    <option value="">None</option>
                    {['Fresh', 'Bestseller', 'Seasonal', 'Healthy', 'New', 'Popular'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Image URL</label>
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} id="instock" />
                <label htmlFor="instock" style={{ fontSize: 13, fontWeight: 600 }}>In Stock</label>
              </div>
              {msg && <p style={{ marginTop: 10, color: msg.includes('!') ? '#1a9e5c' : '#ef4444', fontSize: 13, fontWeight: 600 }}>{msg}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 1, background: '#1a9e5c', color: 'white', border: 'none', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#374151', border: 'none', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="chart-card full">
          <div className="chart-header">
            <h3>📦 Product Inventory</h3>
            <span className="chart-badge">{filtered.length} products</span>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading...</p>
          ) : (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>#</th><th>Product</th><th>Category</th><th>Price</th><th>MRP</th>
                  <th>Discount</th><th>Rating</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id}>
                    <td className="inv-idx">{i + 1}</td>
                    <td>
                      <div className="inv-prod">
                        <img src={p.image} alt={p.name} onError={e => e.target.src = `https://placehold.co/32x32/e8f8f0/1a9e5c?text=${p.name[0]}`} />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="inv-cat">{p.category}</span></td>
                    <td><b>₹{p.price}</b></td>
                    <td className="inv-mrp">₹{p.mrp}</td>
                    <td>{p.discount > 0 ? <span className="inv-disc">{p.discount}%</span> : '—'}</td>
                    <td>⭐ {p.rating}</td>
                    <td><span className="inv-status">{p.inStock !== false ? 'In Stock' : 'Out of Stock'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(p)}
                          style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
