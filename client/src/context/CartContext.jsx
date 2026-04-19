import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const CART_KEY = 'cartnova_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product) => {
    const pid = String(product._id || product.id)
    setItems(prev => {
      const exists = prev.find(i => String(i._id || i.id) === pid)
      if (exists) return prev.map(i =>
        String(i._id || i.id) === pid ? { ...i, qty: i.qty + 1 } : i
      )
      return [...prev, { ...product, qty: 1 }]
    })
  }
  const removeItem = (id) => setItems(prev => prev.filter(i => String(i._id || i.id) !== String(id)))

  const updateQty = (id, qty) => {
      if (qty < 1) return removeItem(id)
      setItems(prev => prev.map(i => String(i._id || i.id) === String(id) ? { ...i, qty } : i))
    }
  const clearCart = () => {
    setItems([])
    localStorage.removeItem(CART_KEY)
  }

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0)
  const totalMrp   = items.reduce((s, i) => s + (i.mrp || i.price) * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, totalMrp }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
