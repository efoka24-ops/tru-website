import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import EquipePage from './pages/EquipePage'
import SyncViewPage from './pages/SyncViewPage'
import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/equipe" element={<EquipePage />} />
              <Route path="/sync" element={<SyncViewPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
