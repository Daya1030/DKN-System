import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Documents from './pages/Documents'
import Header from './components/Header'
import Footer from './components/Footer'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Communities from './pages/Communities'
import Analytics from './pages/Analytics'
import Governance from './pages/Governance'
import Notifications from './pages/Notifications'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import DocumentDetail from './pages/DocumentDetail'
import ProjectDetail from './pages/ProjectDetail'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RequireRole from './components/RequireRole'
import RequireAuth from './components/RequireAuth'

function AppLayout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  
  return (
    <>
      {!isAuthPage && <Header />}
      <main style={{ padding: 16 }}>
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RequireAuth><RequireRole roles={["NewHire","Consultant","KnowledgeChampion","Administrator"]}><Dashboard /></RequireRole></RequireAuth>} />
        <Route path="/projects" element={<RequireAuth><Projects /></RequireAuth>} />
        <Route path="/projects/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
        <Route path="/documents" element={<RequireAuth><Documents /></RequireAuth>} />
        <Route path="/documents/:id" element={<RequireAuth><DocumentDetail /></RequireAuth>} />
        <Route path="/communities" element={<RequireAuth><Communities /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/governance" element={<RequireAuth><RequireRole roles={["Administrator","KnowledgeChampion"]}><Governance /></RequireRole></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><RequireRole roles={["Administrator"]}><Admin /></RequireRole></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
