// API Route Constants
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
  },
  DATASET: {
    UPLOAD: '/dataset/upload',
    LIST: '/dataset/list',
    GET: (id) => `/dataset/${id}`,
    DELETE: (id) => `/dataset/${id}`,
  },
  ANALYSIS: {
    PROFILE: (id) => `/analysis/profile/${id}`,
    HYPOTHESIS: (id) => `/analysis/hypothesis/${id}`,
    INSIGHTS: (id) => `/analysis/generate-insights/${id}`,
    SQL: (id) => `/analysis/generate-sql/${id}`,
    CODE: (id) => `/analysis/generate-code/${id}`,
    EXECUTE: '/analysis/execute-code',
  },
  REPORT: {
    GENERATE: (id) => `/report/generate/${id}`,
    LIST: '/report/list',
    GET: (id) => `/report/${id}`,
  },
}

// Status Colors Map
export const STATUS_COLORS = {
  uploaded: { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  processing: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  profiled: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  analyzed: { bg: 'bg-violet-500/20', text: 'text-violet-400', dot: 'bg-violet-400' },
  error: { bg: 'bg-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
}

// Chart Color Palette
export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#818cf8',
  '#10b981', '#34d399', '#6ee7b7',
  '#f59e0b', '#fbbf24', '#fcd34d',
  '#f43f5e', '#fb7185', '#fda4af',
  '#06b6d4', '#22d3ee', '#67e8f9',
]

// Gradient presets for charts
export const CHART_GRADIENTS = {
  indigo: { start: '#6366f1', end: '#8b5cf6' },
  emerald: { start: '#10b981', end: '#34d399' },
  amber: { start: '#f59e0b', end: '#fbbf24' },
  rose: { start: '#f43f5e', end: '#fb7185' },
  cyan: { start: '#06b6d4', end: '#22d3ee' },
}

// Insight Type Config
export const INSIGHT_TYPES = {
  finding: { color: 'blue', icon: '🔍', label: 'Finding' },
  risk: { color: 'rose', icon: '⚠️', label: 'Risk' },
  opportunity: { color: 'emerald', icon: '🚀', label: 'Opportunity' },
  recommendation: { color: 'amber', icon: '💡', label: 'Recommendation' },
}

// File Size Limits
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
}
