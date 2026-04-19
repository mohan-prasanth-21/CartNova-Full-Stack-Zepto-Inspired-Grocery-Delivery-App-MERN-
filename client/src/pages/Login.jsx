import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const { login, error, setError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const handle = (e) => { e.preventDefault(); setError('') }

  const submit = async (e) => {
    handle(e)
    if (!form.email || !form.password) { setError('Please fill all fields'); return }
    setLoading(true)
    const ok = await login(form.email, form.password)
    setLoading(false)
    if (ok) navigate('/')
  }

  const fillDemo = (email, pass) => setForm({ email, password: pass })

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">C</div>
          <span>CartNova</span>
        </div>
        <h1>India's fastest<br/><span className="grad-text">grocery delivery</span></h1>
        <p>Fresh produce, dairy, snacks & more — delivered in 10 minutes.</p>
        <div className="auth-pills">
          <span>⚡ 10-min delivery</span>
          <span>🛒 10,000+ products</span>
          <span>💸 Best prices</span>
          <span>🔒 Secure checkout</span>
        </div>
        <div className="demo-creds">
          <p>Quick Login:</p>
          <button onClick={() => fillDemo('admin@zepto.com','admin123')}>👑 Admin Login</button>
          <button onClick={() => fillDemo('demo@zepto.com','demo123')}>👤 Demo User</button>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-sub">Login to your CartNova account</p>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Login'}
            </button>
          </form>

          <p className="auth-switch">Don't have an account? <Link to="/register">Sign up free</Link></p>
        </div>
      </div>
    </div>
  )
}
