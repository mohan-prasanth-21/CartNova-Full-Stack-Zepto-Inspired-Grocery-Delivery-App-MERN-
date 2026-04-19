import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { api } from '../api'
import './Orders.css'

const STATUS_STYLE = {
  Delivered:  { bg: '#dcfce7', color: '#15803d' },
  Processing: { bg: '#fef3c7', color: '#92400e' },
  Cancelled:  { bg: '#fee2e2', color: '#b91c1c' },
}

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.getMyOrders()
      .then(data => {
        if (Array.isArray(data)) setOrders(data)
        else setError(data.message || 'Could not load orders')
        setLoading(false)
      })
      .catch(() => { setError('Failed to fetch orders'); setLoading(false) })
  }, [])

  return (
    <div className="orders-pg">
      <Header />
      <div className="orders-wrap">
        <h2 className="orders-title">📦 My Orders</h2>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#888'}}>Loading orders...</div>
        ) : error ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#e44'}}>⚠️ {error}</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your placed orders will appear here</p>
            <button onClick={() => navigate('/home')}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div className="order-card" key={order._id}>
                <div className="order-top">
                  <div>
                    <p className="order-id">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <span className="order-status" style={{ background: STATUS_STYLE[order.status]?.bg, color: STATUS_STYLE[order.status]?.color }}>
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div className="oi" key={idx}>
                      <img src={item.image} alt={item.name} onError={e => e.target.src = `https://placehold.co/48x48/e8f8f0/1a9e5c?text=${item.name[0]}`} />
                      <div>
                        <p className="oi-name">{item.name}</p>
                        <p className="oi-meta">x{item.qty} • {item.weight}</p>
                      </div>
                      <span className="oi-price">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="order-bottom">
                  <div className="order-addr">
                    <span>📍</span>
                    <p>{order.address?.flat}, {order.address?.area}, {order.address?.city} — {order.address?.pincode}</p>
                  </div>
                  <div className="order-total">
                    <span>Total: <b>₹{order.total}</b></span>
                    <span className="order-pay">via {order.payment?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
