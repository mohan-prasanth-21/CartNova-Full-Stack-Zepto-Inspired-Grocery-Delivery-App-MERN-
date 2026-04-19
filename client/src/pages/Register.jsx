import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { register, error, setError } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.name || !form.email || !form.phone || !form.password) { setError('All fields are required'); return }
    if (form.phone.length !== 10) { setError('Enter valid 10-digit phone number'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const ok = await register(form.name, form.email, form.password, form.phone)
    setLoading(false)
    if (ok) navigate('/home')
  }

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><div className="auth-logo">C</div><span>CartNova</span></div>
        <h1>Start getting<br/><span className="grad-text">fresh groceries</span></h1>
        <p>Join millions of happy customers. Sign up in under 60 seconds.</p>
        <div className="auth-pills">
          <span>✅ Free registration</span>
          <span>🎁 ₹100 off first order</span>
          <span>⚡ 10-min delivery</span>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create account</h2>
          <p className="auth-sub">Join CartNova — it's free!</p>

          <form onSubmit={submit} noValidate>
            <div className="fields-row">
              <div className="field">
                <label>Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon">👤</span>
                  <input type="text" placeholder="Your full name" value={form.name} onChange={f('name')} />
                </div>
              </div>
              <div className="field">
                <label>Phone Number</label>
                <div className="input-wrap">
                  <span className="input-icon">📱</span>
                  <input type="tel" maxLength={10} placeholder="10-digit number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/,'')})} />
                </div>
              </div>
            </div>

            <div className="field">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉️</span>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={f('email')} />
              </div>
            </div>

            <div className="fields-row">
              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={f('password')} />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input type="password" placeholder="Repeat password" value={form.confirm} onChange={f('confirm')} />
                </div>
              </div>
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/">Login</Link></p>
        </div>
      </div>
    </div>
  )
}
