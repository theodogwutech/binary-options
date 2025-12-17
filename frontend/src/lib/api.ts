import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Clear all auth data
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('auth-storage')

        // Redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
}

export const tradeAPI = {
  createTrade: (data: any) => api.post('/trades', data),
  getTrades: (params?: any) => api.get('/trades', { params }),
  getTradeById: (id: string) => api.get(`/trades/${id}`),
  closeTrade: (id: string) => api.post(`/trades/${id}/close`),
  getStats: () => api.get('/trades/stats'),
}

export const assetAPI = {
  getAssets: (params?: any) => api.get('/assets', { params }),
  getAssetById: (id: string) => api.get(`/assets/${id}`),
}

export const userAPI = {
  fundBalance: (data: { amount: number; paymentMethod: string }) => api.post('/users/fund', data),
  getProfile: () => api.get('/users/profile'),
}
