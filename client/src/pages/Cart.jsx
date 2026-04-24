import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Cart() {
  const { items, removeItem, updateQty, totalItems, totalPrice, totalMrp } = useCart()
  const navigate = useNavigate()
  const deliveryFee = totalPrice >= 199 ? 0 : 29
  const savings   = totalMrp - totalPrice
  const grandTotal = totalPrice + deliveryFee

  return (
    <div className="cart-pg">
      <Header />
      <div className="cart-wrap">
        <h2 className="cart-heading">🛒 My Cart {totalItems > 0 && <span className="cart-cnt-badge">{totalItems} items</span>}</h2>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="ce-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add fresh groceries to get started</p>
            <button onClick={() => navigate('/home')}>Start Shopping</button>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Items list */}
            <div className="cart-items-col">
              <div className="delivery-banner">
                <span>⚡ Delivery in <b>10 minutes</b></span>
                {deliveryFee === 0
                  ? <span className="free-tag-pill">🎉 Free delivery!</span>
                  : <span className="add-more-tag">Add ₹{199 - totalPrice} more for free delivery</span>}
              </div>

              {items.map(item => (
                <div className="cart-item" key={item._id || item.id}>
                  <img src={item.image} alt={item.name} className="ci-img"
                    onError={e => { e.target.src = `https://placehold.co/80x80/e8f8f0/1a9e5c?text=${encodeURIComponent(item.name[0])}` }} />
                  <div className="ci-details">
                    <p className="ci-name">{item.name}</p>
                    <p className="ci-meta">{item.weight} • {item.category}</p>
                    <div className="ci-price-row">
                      <span className="ci-price">₹{item.price}</span>
                      {item.discount > 0 && <span className="ci-mrp">₹{item.mrp}</span>}
                      {item.discount > 0 && <span className="ci-disc">{item.discount}% off</span>}
                    </div>
                  </div>
                  <div className="ci-actions">
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(String(item._id || item.id), item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(String(item._id || item.id), item.qty + 1)}>+</button>
                    </div>
                    <p className="ci-subtotal">₹{item.price * item.qty}</p>
                    <button className="ci-remove" onClick={() => removeItem(String(item._id || item.id))} title="Remove">🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill summary */}
            <div className="bill-col">
              <div className="bill-card">
                <h3>Bill Details</h3>
                <div className="bill-rows">
                  <div className="bill-row"><span>MRP Total</span><span>₹{totalMrp}</span></div>
                  <div className="bill-row green"><span>Product Discount</span><span>− ₹{savings}</span></div>
                  <div className="bill-row"><span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? <b style={{color:'var(--primary)'}}>FREE</b> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="bill-row"><span>Platform Fee</span><span>₹2</span></div>
                </div>
                <hr className="bill-hr"/>
                <div className="bill-row grand"><span>Grand Total</span><span>₹{grandTotal + 2}</span></div>
                {savings > 0 && <p className="savings-note">🎉 You save ₹{savings} on this order!</p>}
                <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout — ₹{grandTotal + 2}
                </button>
                <p className="secure-note">🔒 Safe & Secure Payments</p>
              </div>

              <div className="offers-card">
                <h4>🏷️ Available Offers</h4>
                <div className="offer-item"><span className="offer-code">ZEPTO100</span><span>₹100 off on first order</span></div>
                <div className="offer-item"><span className="offer-code">FRESH20</span><span>20% off on fruits & veggies</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
