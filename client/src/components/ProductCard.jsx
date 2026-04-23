  import React, { useState } from 'react'
  import { useCart } from '../context/CartContext'
  import './ProductCard.css'

  const BADGE_COLORS = {
    Bestseller: { bg: '#fff3e0', color: '#e65100' },
    Fresh:      { bg: '#e8f8f0', color: '#1a9e5c' },
    Seasonal:   { bg: '#fce4ec', color: '#c2185b' },
    Healthy:    { bg: '#e3f2fd', color: '#1565c0' },
  }

  export default function ProductCard({ product }) {
    const { items, addItem, updateQty } = useCart()
    const pid = product._id || product.id
    const cartItem = items.find(i => (i._id || i.id) === pid)
    const [imgError, setImgError] = useState(false)
    const badgeStyle = BADGE_COLORS[product.badge] || {}

    return (
      <div className="pcard">
        <div className="pcard-img-wrap">
          {product.discount > 0 && (
            <span className="disc-tag">{product.discount}% OFF</span>
          )}
          {product.badge && (
            <span className="badge-tag" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
              {product.badge}
            </span>
          )}
          <img
            src={imgError ? `https://placehold.co/300x300/e8f8f0/1a9e5c?text=${encodeURIComponent(product.name)}` : product.image}
            alt={product.name}
            className="pcard-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
        <div className="pcard-body">
          <p className="pcard-weight">{product.weight}</p>
          <p className="pcard-name">{product.name}</p>
          <div className="pcard-rating">⭐ {product.rating} <span className="pcard-cat">{product.category}</span></div>
          <div className="pcard-footer">
            <div className="pcard-price">
              <span className="price-now">₹{product.price}</span>
              {product.discount > 0 && <span className="price-old">₹{product.mrp}</span>}
            </div>
            {!cartItem ? (
              <button className="pcard-add" onClick={() => addItem(product)}>ADD</button>
            ) : (
              <div className="pcard-qty">
                <button onClick={() => updateQty(pid, cartItem.qty - 1)}>−</button>
                <span>{cartItem.qty}</span>
                <button onClick={() => updateQty(pid, cartItem.qty + 1)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
