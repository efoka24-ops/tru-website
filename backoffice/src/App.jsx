import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import EquipeSimplePage from './pages/EquipeSimplePage'
import ServicesPage from './pages/ServicesPage'
import SolutionsPage from './pages/SolutionsPage'
import ContactsPage from './pages/ContactsPage'
import TestimonialsPage from './pages/TestimonialsPage'
import SettingsPage from './pages/SettingsPage'
import SyncViewPage from './pages/SyncViewPage'
import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminLayout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/equipe" element={<EquipeSimplePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/sync" element={<SyncViewPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
