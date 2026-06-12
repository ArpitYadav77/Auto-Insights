import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { API_ROUTES } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const isAuthenticated = !!user && !!token

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        const res = await api.get(API_ROUTES.AUTH.PROFILE)
        setUser(res.data?.data?.user || res.data?.user || res.data)
        setToken(storedToken)
      } catch (err) {
        console.error('Token validation failed:', err)
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    validateToken()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post(API_ROUTES.AUTH.LOGIN, { email, password })
    const payload = res.data?.data || res.data
    const { token: newToken, user: userData } = payload
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    return res.data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await api.post(API_ROUTES.AUTH.REGISTER, { name, email, password })
    const payload = res.data?.data || res.data
    const { token: newToken, user: userData } = payload
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }))
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
