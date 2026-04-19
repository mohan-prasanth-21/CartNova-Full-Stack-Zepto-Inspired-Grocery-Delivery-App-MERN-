import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import './Checkout.css'

const PAYMENT_METHODS = [
  { id: 'upi',  label: 'UPI',              icon: '📱', sub: 'PhonePe, GPay, Paytm' },
  { id: 'card', label: 'Credit/Debit Card', icon: '💳', sub: 'Visa, Mastercard, RuPay' },
  { id: 'cod',  label: 'Cash on Delivery',  icon: '💵', sub: 'Pay when order arrives' },
  { id: 'nb',   label: 'Net Banking',       icon: '🏦', sub: 'All major banks' },
]

function SuccessModal({ orderId, address, total, onClose }) {
  return (
    <div className="modal-bg">
      <div className="success-modal">
        <div className="sm-check">✅</div>
        <h2>Order Placed!</h2>
        <p className="sm-id">Order ID: <b>#{orderId?.slice(-8).toUpperCase()}</b></p>
        <div className="sm-eta">
          <span className="sm-eta-icon">⚡</span>
          <div>
            <p className="sm-eta-title">Arriving in 10 minutes</p>
            <p className="sm-eta-addr">{address.flat}, {address.area}, {address.city}</p>
          </div>
        </div>
        <div className="sm-total">Total Paid: <b>₹{total}</b></div>
        <div className="sm-steps">
          <div className="sm-step done"><span>✅</span><p>Order Confirmed</p></div>
          <div className="sm-step-line active" />
          <div className="sm-step active"><span>🏃</span><p>Out for Delivery</p></div>
          <div className="sm-step-line" />
          <div className="sm-step"><span>🏠</span><p>Delivered</p></div>
        </div>
        <div className="sm-actions">
          <button className="sm-track">📍 Track Live Order</button>
          <button className="sm-home" onClick={onClose}>Continue Shopping</button>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const { items, totalPrice, totalMrp, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const deliveryFee  = totalPrice >= 199 ? 0 : 29
  const savings      = totalMrp - totalPrice
  const grandTotal   = totalPrice + deliveryFee + 2

  const [addr, setAddr] = useState({
    name: user?.name || '', phone: user?.phone || '',
    flat: '', area: '', landmark: '', city: 'Mumbai', pincode: '', type: 'Home'
  })
  const [payment, setPayment]       = useState('upi')
  const [upiId, setUpiId]           = useState('')
  const [coupon, setCoupon]         = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [orderId, setOrderId]       = useState('')
  const [apiError, setApiError]     = useState('')

  const setA = (k) => (e) => setAddr({ ...addr, [k]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!addr.name.trim())    errs.name    = 'Name required'
    if (addr.phone.length !== 10) errs.phone = 'Valid 10-digit number required'
    if (!addr.flat.trim())    errs.flat    = 'House/Flat number required'
    if (!addr.area.trim())    errs.area    = 'Area required'
    if (!addr.pincode.trim() || addr.pincode.length !== 6) errs.pincode = 'Valid 6-digit pincode required'
    if (payment === 'upi' && !upiId.includes('@')) errs.upi = 'Enter valid UPI ID (e.g. name@upi)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'CART100' || coupon.toUpperCase() === 'FRESH20') {
      setCouponApplied(true)
    } else {
      setErrors({ ...errors, coupon: 'Invalid coupon code' })
    }
  }

  const finalTotal = couponApplied ? grandTotal - 100 : grandTotal

  const placeOrder = async () => {
    if (!validate()) return
    if (items.length === 0) { navigate('/home'); return }
    setLoading(true)
    setApiError('')

    const orderPayload = {
      items: items.map(i => ({
        productId: i._id || i.id,
        name:      i.name,
        image:     i.image,
        price:     i.price,
        mrp:       i.mrp,
        weight:    i.weight,
        qty:       i.qty,
      })),
      address: addr,
      payment,
      total: finalTotal,
    }

    try {
      const data = await api.placeOrder(orderPayload)
      if (data.message && !data._id) {
        setApiError(data.message)
        setLoading(false)
        return
      }
      setOrderId(data._id)
      setLoading(false)
      setSuccess(true)
    } catch (err) {
      setApiError('Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  const handleSuccessClose = () => { clearCart(); navigate('/home') }

  if (items.length === 0 && !success) {
    navigate('/cart')
    return null
  }

  return (
    <div className="checkout-pg">
      <Header />
      {success && <SuccessModal orderId={orderId} address={addr} total={finalTotal} onClose={handleSuccessClose} />}

      <div className="checkout-wrap">
        <h2 className="checkout-title">🏠 Checkout</h2>

        <div className="checkout-grid">
          {/* Left - Address + Payment */}
          <div className="checkout-left">

            {/* Delivery Address */}
            <div className="co-card">
              <h3>📍 Delivery Address</h3>
              <div className="addr-type-row">
                {['Home','Work','Other'].map(t => (
                  <button key={t} className={`type-btn ${addr.type === t ? 'active' : ''}`} onClick={() => setAddr({...addr, type: t})}>{t}</button>
                ))}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input value={addr.name} onChange={setA('name')} placeholder="Your full name" className={errors.name ? 'err' : ''} />
                  {errors.name && <span className="ferr">{errors.name}</span>}
                </div>
                <div className="form-field">
                  <label>Phone Number *</label>
                  <input value={addr.phone} onChange={e => setAddr({...addr, phone: e.target.value.replace(/\D/,'').slice(0,10)})} maxLength={10} placeholder="10-digit mobile" className={errors.phone ? 'err' : ''} />
                  {errors.phone && <span className="ferr">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>House / Flat / Floor *</label>
                  <input value={addr.flat} onChange={setA('flat')} placeholder="e.g. 4B, 2nd Floor" className={errors.flat ? 'err' : ''} />
                  {errors.flat && <span className="ferr">{errors.flat}</span>}
                </div>
                <div className="form-field">
                  <label>Area / Street *</label>
                  <input value={addr.area} onChange={setA('area')} placeholder="e.g. Andheri West" className={errors.area ? 'err' : ''} />
                  {errors.area && <span className="ferr">{errors.area}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Landmark (Optional)</label>
                  <input value={addr.landmark} onChange={setA('landmark')} placeholder="Near temple, park, etc." />
                </div>
                <div className="form-field">
                  <label>City</label>
                  <select value={addr.city} onChange={setA('city')} className="form-select">
                    {['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Pincode *</label>
                  <input value={addr.pincode} onChange={e => setAddr({...addr, pincode: e.target.value.replace(/\D/,'').slice(0,6)})} placeholder="6-digit pincode" className={errors.pincode ? 'err' : ''} />
                  {errors.pincode && <span className="ferr">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="co-card">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.id} className={`pm-option ${payment === pm.id ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={pm.id} checked={payment === pm.id} onChange={() => setPayment(pm.id)} hidden />
                    <span className="pm-icon">{pm.icon}</span>
                    <div>
                      <p className="pm-label">{pm.label}</p>
                      <p className="pm-sub">{pm.sub}</p>
                    </div>
                    {payment === pm.id && <span className="pm-check">✓</span>}
                  </label>
                ))}
              </div>
              {payment === 'upi' && (
                <div className="form-field" style={{marginTop: 12}}>
                  <label>UPI ID *</label>
                  <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. yourname@paytm" className={errors.upi ? 'err' : ''} />
                  {errors.upi && <span className="ferr">{errors.upi}</span>}
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="co-card">
              <h3>🏷️ Apply Coupon</h3>
              {couponApplied ? (
                <div className="coupon-success">✅ Coupon <b>{coupon.toUpperCase()}</b> applied!</div>
              ) : (
                <div className="coupon-row">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code" className={errors.coupon ? 'err' : ''} />
                  <button onClick={applyCoupon}>Apply</button>
                </div>
              )}
              {errors.coupon && <span className="ferr">{errors.coupon}</span>}
              <p className="coupon-hint">Try: CART100 · FRESH20</p>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="checkout-right">
            <div className="co-card summary-card">
              <h3>🧾 Order Summary</h3>
              <div className="summary-items">
                {items.map(item => (
                  <div className="sum-item" key={item._id || item.id}>
                    <img src={item.image} alt={item.name} onError={e => e.target.src = `https://placehold.co/48x48/e8f8f0/1a9e5c?text=${item.name[0]}`} />
                    <div className="sum-item-info">
                      <p>{item.name}</p>
                      <p className="sum-item-qty">x{item.qty} × ₹{item.price}</p>
                    </div>
                    <span className="sum-item-total">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <hr className="sum-divider"/>
              <div className="sum-rows">
                <div className="sum-row"><span>MRP Total</span><span>₹{totalMrp}</span></div>
                <div className="sum-row green"><span>Discount</span><span>− ₹{savings}</span></div>
                <div className="sum-row"><span>Delivery</span><span>{deliveryFee === 0 ? <b style={{color:'var(--primary)'}}>FREE</b> : `₹${deliveryFee}`}</span></div>
                <div className="sum-row"><span>Platform Fee</span><span>₹2</span></div>
                {couponApplied && <div className="sum-row green"><span>Coupon Discount</span><span>− ₹100</span></div>}
              </div>
              <hr className="sum-divider"/>
              <div className="sum-row grand"><span>Total Amount</span><span>₹{finalTotal}</span></div>

              {apiError && <div className="auth-error" style={{margin:'8px 0'}}>⚠️ {apiError}</div>}

              <button className="place-order-btn" onClick={placeOrder} disabled={loading}>
                {loading ? <><span className="btn-spinner"/>Processing...</> : `🚀 Place Order — ₹${finalTotal}`}
              </button>
              <p className="secure-txt">🔒 Your data is 100% secure</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
