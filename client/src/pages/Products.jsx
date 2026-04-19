import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import BottomNav from '../components/BottomNav'
import { api } from '../api'
import './Products.css'

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

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('all')
  const [sort, setSort]         = useState('default')
  const [maxPrice, setMaxPrice] = useState(200)
  const [mobileFilter, setMobileFilter] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getProducts().then(data => {
      if (Array.isArray(data)) setProducts(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  let filtered = products.filter(p => {
    const matchCat    = cat === 'all' || p.category === cat
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchPrice  = p.price <= maxPrice
    return matchCat && matchSearch && matchPrice
  })

  if (sort === 'price-asc')  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sort === 'discount')   filtered = [...filtered].sort((a, b) => b.discount - a.discount)
  if (sort === 'rating')     filtered = [...filtered].sort((a, b) => b.rating - a.rating)

  const FilterPanel = () => (
    <aside className="filter-panel">
      <div className="filter-section">
        <h4>Categories</h4>
        {categories.map(c => (
          <button
            key={c.id}
            className={`fcat-btn ${cat === c.id ? 'active' : ''}`}
            onClick={() => setCat(c.id)}
          >
            <span>{c.emoji} {c.label}</span>
            <span className="fcat-cnt">
              {c.id === 'all' ? products.length : products.filter(p => p.category === c.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="filter-section">
        <h4>Max Price: ₹{maxPrice}</h4>
        <input
          type="range" min={14} max={200} value={maxPrice}
          onChange={e => setMaxPrice(+e.target.value)}
        />
      </div>
    </aside>
  )

  return (
    <div className="products-pg">
      <Header search={search} setSearch={setSearch} />

      <div className="products-wrap">
        <FilterPanel />

        <div className="products-body">
          <div className="ptop-bar">
            <h2>All Products</h2>
            <span>{filtered.length} results</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="price-asc">Low → High</option>
              <option value="price-desc">High → Low</option>
              <option value="discount">Discount</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {loading ? (
            <div className="pgrid">{[...Array(8)].map((_,i) => <div key={i} className="product-skeleton"/>)}</div>
          ) : filtered.length > 0 ? (
            <div className="pgrid">
              {filtered.map(p => <ProductCard key={p._id || p.id} product={p} />)}
            </div>
          ) : (
            <div style={{textAlign:'center',padding:'40px 0'}}>
              <h3>😕 No products found</h3>
              <button onClick={() => { setCat('all'); setSearch(''); setMaxPrice(200) }}>Reset Filters</button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
