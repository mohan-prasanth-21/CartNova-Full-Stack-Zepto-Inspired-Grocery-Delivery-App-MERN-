import React, { createContext, useContext, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cartnova_user')) } catch { return null }
  })
  const [error, setError] = useState('')

  const login = async (email, password) => {
    setError('')
    const data = await api.login(email, password)
    if (data.message) { setError(data.message); return false }
    setUser(data)
    localStorage.setItem('cartnova_user', JSON.stringify(data))
    return true
  }

  const register = async (name, email, password, phone) => {
    setError('')
    const data = await api.register(name, email, password, phone)
    if (data.message) { setError(data.message); return false }
    setUser(data)
    localStorage.setItem('cartnova_user', JSON.stringify(data))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cartnova_user')
  }

  return (
    <AuthContext.Provider value={{ user, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
