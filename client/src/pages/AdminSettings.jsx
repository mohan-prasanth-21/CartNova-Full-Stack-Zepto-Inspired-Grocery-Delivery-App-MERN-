import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Analytics.css'

const SETTINGS_KEY = 'cartnova_settings'

const defaultSettings = {
  storeName: 'CartNova',
  storeEmail: 'support@cartnova.com',
  storePhone: '+91 98765 43210',
  deliveryFee: 29,
  freeDeliveryAbove: 199,
  platformFee: 2,
  deliveryTime: '10',
  coupons: [
    { code: 'CART100', discount: 100, type: 'flat' },
    { code: 'FRESH20', discount: 20, type: 'percent' },
  ],
  cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'],
  maintenanceMode: false,
  allowRegistration: true,
}

export default function AdminSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [settings, setSettings] = useState(() => {
    try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) } }
    catch { return defaultSettings }
  })

  const [activeTab, setActiveTab] = useState('store')
  const [saved, setSaved] = useState(false)
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'flat' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')

  const save = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount) return
    setSettings(prev => ({ ...prev, coupons: [...prev.coupons, { ...newCoupon, code: newCoupon.code.toUpperCase() }] }))
    setNewCoupon({ code: '', discount: '', type: 'flat' })
  }

  const deleteCoupon = (code) => {
    setSettings(prev => ({ ...prev, coupons: prev.coupons.filter(c => c.code !== code) }))
  }

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) { setPwMsg('Fill all fields'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg('Passwords do not match'); return }
    if (pwForm.newPw.length < 6) { setPwMsg('Password must be at least 6 characters'); return }
    try {
      const token = JSON.parse(localStorage.getItem('cartnova_user'))?.token
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
      })
      const data = await res.json()
      setPwMsg(data.message || 'Password changed!')
      if (res.ok) setPwForm({ current: '', newPw: '', confirm: '' })
    } catch { setPwMsg('Failed to change password') }
  }

  const TABS = [
    { id: 'store', label: '🏪 Store', },
    { id: 'delivery', label: '🚚 Delivery' },
    { id: 'coupons', label: '🏷️ Coupons' },
    { id: 'security', label: '🔐 Security' },
    { id: 'system', label: '⚙️ System' },
  ]

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
            <button key={label}
              className={`anav-btn ${window.location.pathname === path ? 'active' : ''}`}
              onClick={() => navigate(path)}>
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
            <h1>⚙️ Settings</h1>
            <p className="at-sub">Manage your store configuration</p>
          </div>
          <button onClick={save} style={{ background: saved ? '#dcfce7' : '#1a9e5c', color: saved ? '#15803d' : 'white', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s' }}>
            {saved ? '✅ Saved!' : '💾 Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'white', padding: 6, borderRadius: 12, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: activeTab === t.id ? '#1a9e5c' : 'transparent', color: activeTab === t.id ? 'white' : '#64748b', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Store Settings */}
        {activeTab === 'store' && (
          <div className="chart-card full">
            <div className="chart-header"><h3>🏪 Store Information</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Store Name', 'storeName', 'text'],
                ['Support Email', 'storeEmail', 'email'],
                ['Support Phone', 'storePhone', 'text'],
                ['Delivery Time (mins)', 'deliveryTime', 'number'],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type} value={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Settings */}
        {activeTab === 'delivery' && (
          <div className="chart-card full">
            <div className="chart-header"><h3>🚚 Delivery Configuration</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                ['Delivery Fee (₹)', 'deliveryFee'],
                ['Free Delivery Above (₹)', 'freeDeliveryAbove'],
                ['Platform Fee (₹)', 'platformFee'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type="number" value={settings[key]} onChange={e => setSettings({ ...settings, [key]: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 8 }}>Available Cities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {settings.cities.map(city => (
                  <span key={city} style={{ background: '#e8f8f0', color: '#1a9e5c', padding: '5px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {city}
                    <button onClick={() => setSettings(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }))}
                      style={{ background: 'none', border: 'none', color: '#1a9e5c', cursor: 'pointer', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input id="newCity" placeholder="Add new city..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <button onClick={() => {
                  const val = document.getElementById('newCity').value.trim()
                  if (val && !settings.cities.includes(val)) {
                    setSettings(prev => ({ ...prev, cities: [...prev.cities, val] }))
                    document.getElementById('newCity').value = ''
                  }
                }} style={{ background: '#1a9e5c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                  + Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coupons */}
        {activeTab === 'coupons' && (
          <div className="chart-card full">
            <div className="chart-header"><h3>🏷️ Coupon Management</h3></div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                placeholder="COUPON CODE" style={{ flex: 1, minWidth: 120, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700 }} />
              <input type="number" value={newCoupon.discount} onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                placeholder="Discount" style={{ width: 100, padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <select value={newCoupon.type} onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <option value="flat">₹ Flat</option>
                <option value="percent">% Percent</option>
              </select>
              <button onClick={addCoupon} style={{ background: '#1a9e5c', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                + Add Coupon
              </button>
            </div>
            <table className="orders-table">
              <thead><tr><th>Code</th><th>Discount</th><th>Type</th><th>Action</th></tr></thead>
              <tbody>
                {settings.coupons.map(c => (
                  <tr key={c.code}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a9e5c', background: '#e8f8f0', padding: '3px 10px', borderRadius: 6 }}>{c.code}</span></td>
                    <td><b>{c.type === 'flat' ? `₹${c.discount}` : `${c.discount}%`}</b></td>
                    <td><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{c.type === 'flat' ? 'Flat Off' : 'Percentage'}</span></td>
                    <td>
                      <button onClick={() => deleteCoupon(c.code)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="chart-card full">
            <div className="chart-header"><h3>🔐 Change Password</h3></div>
            <div style={{ maxWidth: 400 }}>
              {[
                ['Current Password', 'current'],
                ['New Password', 'newPw'],
                ['Confirm New Password', 'confirm'],
              ].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
              {pwMsg && <p style={{ fontSize: 13, fontWeight: 600, color: pwMsg.includes('changed') || pwMsg.includes('!') ? '#15803d' : '#ef4444', marginBottom: 12 }}>{pwMsg}</p>}
              <button onClick={changePassword} style={{ background: '#1a9e5c', color: 'white', border: 'none', padding: '11px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                🔐 Change Password
              </button>
            </div>
          </div>
        )}

        {/* System */}
        {activeTab === 'system' && (
          <div className="chart-card full">
            <div className="chart-header"><h3>⚙️ System Settings</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['🔧 Maintenance Mode', 'maintenanceMode', 'Disable store for customers temporarily'],
                ['📝 Allow Registration', 'allowRegistration', 'Allow new users to register'],
              ].map(([label, key, desc]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{label}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{desc}</p>
                  </div>
                  <div onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                    style={{ width: 48, height: 26, borderRadius: 99, background: settings[key] ? '#1a9e5c' : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: settings[key] ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}

              <div style={{ padding: 16, background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#ef4444' }}>🗑️ Danger Zone</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 12 }}>These actions cannot be undone. Be careful!</p>
                <button onClick={() => { if (window.confirm('Clear all settings and reset to defaults?')) { localStorage.removeItem(SETTINGS_KEY); setSettings(defaultSettings) } }}
                  style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Reset All Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
