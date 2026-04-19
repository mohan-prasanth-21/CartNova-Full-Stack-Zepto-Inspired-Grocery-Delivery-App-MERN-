import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import BottomNav from '../components/BottomNav'
import { api } from '../api'
import './Home.css'

const categories = [
  { id: 'all',        label: 'All',        emoji: '🛒' },
  { id: 'Fruits',     label: 'Fruits',     emoji: '🍎' },
  { id: 'Vegetables', label: 'Vegetables', emoji: '🥦' },
  { id: 'Dairy',      label: 'Dairy',      emoji: '🥛' },
  { id: 'Snacks',     label: 'Snacks',     emoji: '🍟' },
  { id: 'Beverages',  label: 'Beverages',  emoji: '🥤' },
  { id: 'Frozen',     label: 'Frozen',     emoji: '🧊' },
  { id: 'Bakery',     label: 'Bakery',     emoji: '🍞' },
]

const banners = [
  { bg: 'linear-gradient(135deg,#0d7a46,#1a9e5c)', title: '⚡ 10-Min Delivery', sub: 'Fresh groceries at your doorstep — faster than ever', cta: 'Order Now' },
  { bg: 'linear-gradient(135deg,#e65100,#ff6b00)', title: '🍎 50% OFF Fruits',  sub: 'Fresh seasonal produce at unbeatable prices today',   cta: 'Shop Fruits' },
  { bg: 'linear-gradient(135deg,#1565c0,#3b82f6)', title: '🚀 Free Delivery',   sub: 'Zero delivery fee on all orders above ₹199',         cta: 'Shop Now' },
  { bg: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', title: '🎁 New User Offer',  sub: 'Get ₹100 off on your first order — use CART100',     cta: 'Claim Now' },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('all')
  const [slide, setSlide]       = useState(0)

  useEffect(() => {
    api.getProducts().then(data => {
      if (Array.isArray(data)) setProducts(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide(i => (i + 1) % banners.length), 3500)
    return () => clearInterval(t)
  }, [])

  const filtered = products.filter(p =>
    (cat === 'all' || p.category === cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  )

  const countFor = (id) => id === 'all' ? products.length : products.filter(p => p.category === id).length

  return (
    <div className="home">
      <Header search={search} setSearch={setSearch} />
      <main className="home-main">

        {/* Hero Banner */}
        <section className="banner-section">
          <div className="banner" style={{ background: banners[slide].bg }}>
            <div className="banner-text">
              <h2>{banners[slide].title}</h2>
              <p>{banners[slide].sub}</p>
              <button className="banner-cta">{banners[slide].cta} →</button>
            </div>
            <div className="banner-deco">🛒</div>
          </div>
          <div className="banner-nav">
            {banners.map((_,i) => (
              <button key={i} className={`bdot ${i === slide ? 'on' : ''}`} onClick={() => setSlide(i)} />
            ))}
          </div>
        </section>

        {/* Quick strip */}
        <div className="strip">
          <span>⚡ <b>10-min delivery</b> guaranteed</span>
          <span>🛡️ 100% fresh or refund</span>
          <span>🆓 Free delivery above ₹199</span>
          <span>🏆 10,000+ products</span>
        </div>

        {/* Categories */}
        <section className="section">
          <h3 className="sec-title">Shop by Category</h3>
          <div className="cat-scroll">
            {categories.map(c => (
              <button key={c.id} className={`cat-chip ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
                <span className="cat-emoji">{c.emoji}</span>
                <span>{c.label}</span>
                <span className="cat-count">{countFor(c.id)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Products */}
        <section className="section">
          <div className="sec-row">
            <h3 className="sec-title">{cat === 'all' ? '🔥 Best Sellers' : `${categories.find(c=>c.id===cat)?.emoji} ${cat}`}</h3>
            <span className="sec-count">{filtered.length} items</span>
          </div>
          {loading ? (
            <div className="loading-grid">{[...Array(8)].map((_,i) => <div key={i} className="product-skeleton"/>)}</div>
          ) : filtered.length > 0 ? (
            <div className="pgrid">{filtered.map(p => <ProductCard key={p._id || p.id} product={p} />)}</div>
          ) : (
            <div className="empty">
              <p>😕 No products found for "<b>{search}</b>"</p>
              <button onClick={() => { setSearch(''); setCat('all') }}>Clear Search</button>
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
