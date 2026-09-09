import axios from 'axios'

const customerClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

customerClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default customerClient
