import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './components/common/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DatasetUploadPage from './pages/DatasetUploadPage'
import AnalysisPage from './pages/AnalysisPage'
import InsightsPage from './pages/InsightsPage'
import ReportPage from './pages/ReportPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/datasets"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DatasetUploadPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis/:datasetId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnalysisPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights/:datasetId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InsightsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ReportPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:reportId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ReportPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
