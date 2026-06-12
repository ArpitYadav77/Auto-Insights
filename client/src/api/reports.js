import api from './axios'
import { API_ROUTES } from '../utils/constants'

export const generateReport = (datasetId) => {
  return api.post(API_ROUTES.REPORT.GENERATE(datasetId))
}

export const getReports = () => {
  return api.get(API_ROUTES.REPORT.LIST)
}

export const getReportById = (reportId) => {
  return api.get(API_ROUTES.REPORT.GET(reportId))
}
