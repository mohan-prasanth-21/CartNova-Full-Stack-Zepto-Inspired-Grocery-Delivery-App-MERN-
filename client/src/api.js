// Central API utility — all backend calls go through here

const BASE = '/api'

const getToken = () => {
  try { return JSON.parse(localStorage.getItem('cartnova_user'))?.token || '' }
  catch { return '' }
}

const authHeader = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` })

export const api = {
  //  Auth 
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(r => r.json()),

  register: (name, email, password, phone) =>
    fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, phone }) }).then(r => r.json()),
  
  getUsers: () =>
    fetch(`${BASE}/auth/users`, { headers: authHeader() }).then(r => r.json()),

  deleteUser: (id) =>
    fetch(`${BASE}/auth/users/${id}`, { method: 'DELETE', headers: authHeader() }).then(r => r.json()),
  
  //  Products 
  getProducts: (category) => {
    const qs = category && category !== 'all' ? `?category=${category}` : ''
    return fetch(`${BASE}/products${qs}`).then(r => r.json())
  },

  //  Orders 
  placeOrder: (order) =>
    fetch(`${BASE}/orders`, { method: 'POST', headers: authHeader(), body: JSON.stringify(order) }).then(r => r.json()),

  getMyOrders: () =>
    fetch(`${BASE}/orders/mine`, { headers: authHeader() }).then(r => r.json()),

  getAllOrders: () =>
    fetch(`${BASE}/orders`, { headers: authHeader() }).then(r => r.json()),
}
