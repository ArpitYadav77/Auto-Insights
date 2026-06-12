import api from './axios'
import { API_ROUTES } from '../utils/constants'

export const profileDataset = (datasetId) => {
  return api.post(API_ROUTES.ANALYSIS.PROFILE(datasetId))
}

export const generateHypotheses = (datasetId) => {
  return api.post(API_ROUTES.ANALYSIS.HYPOTHESIS(datasetId))
}

export const generateInsights = (datasetId) => {
  return api.post(API_ROUTES.ANALYSIS.INSIGHTS(datasetId))
}

export const generateSQL = (datasetId) => {
  return api.post(API_ROUTES.ANALYSIS.SQL(datasetId))
}

export const generateCode = (datasetId, question) => {
  return api.post(API_ROUTES.ANALYSIS.CODE(datasetId), { question })
}

export const executeCode = (datasetId, code) => {
  return api.post(API_ROUTES.ANALYSIS.EXECUTE, { code, datasetId })
}
