import api from './axios'
import { API_ROUTES } from '../utils/constants'

export const loginUser = (email, password) => {
  return api.post(API_ROUTES.AUTH.LOGIN, { email, password })
}

export const registerUser = (name, email, password) => {
  return api.post(API_ROUTES.AUTH.REGISTER, { name, email, password })
}

export const getProfile = () => {
  return api.get(API_ROUTES.AUTH.PROFILE)
}

export const updateProfile = (data) => {
  return api.put(API_ROUTES.AUTH.UPDATE_PROFILE, data)
}

export const changePassword = (currentPassword, newPassword) => {
  return api.put(`${API_ROUTES.AUTH.PROFILE}/password`, { currentPassword, newPassword })
}
