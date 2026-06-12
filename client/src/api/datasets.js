import api from './axios'
import { API_ROUTES } from '../utils/constants'

export const uploadDataset = (formData, onProgress) => {
  return api.post(API_ROUTES.DATASET.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
  })
}

export const getDatasets = () => {
  return api.get(API_ROUTES.DATASET.LIST)
}

export const getDatasetById = (id) => {
  return api.get(API_ROUTES.DATASET.GET(id))
}

export const deleteDataset = (id) => {
  return api.delete(API_ROUTES.DATASET.DELETE(id))
}
