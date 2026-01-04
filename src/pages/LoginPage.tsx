import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
const BACKEND_HINT = `Make sure backend is running at ${API_BASE}`

const COUNTRIES = ['USA', 'Europe', 'Asia']

// Dummy credentials for testing
let DUMMY_USERS: Record<string, { password: string; name: string; role: 'NewHire' | 'Consultant' | 'KnowledgeChampion' | 'Administrator'; country: string }> = {
  'admin@dkn.com': { password: 'admin123', name: 'Admin User', role: 'Administrator', country: 'USA' },
  'champion@dkn.com': { password: 'champion123', name: 'Knowledge Champion', role: 'KnowledgeChampion', country: 'Europe' },
  'consultant@dkn.com': { password: 'consultant123', name: 'Consultant', role: 'Consultant', country: 'USA' },
  'newhire@dkn.com': { password: 'newhire123', name: 'New Hire', role: 'NewHire', country: 'USA' },
  'bhuwan@dkn.com': { password: 'bhuwan123', name: 'Bhuwan', role: 'Consultant', country: 'USA' }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { push } = useToast()
  const [loading, setLoading] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginCountry, setLoginCountry] = useState('USA')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      push('❌ Please fill all fields')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('dkn:accountPassword', loginPassword)
        login(data.user.name, data.user.email, data.user.country || 'USA', data.user.role, data.user.id)
        push(`✅ Welcome ${data.user.name}! Logged in as ${data.user.role}`)
        navigate('/dashboard')
      } else {
        push(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Login error:', error)
      push(`❌ Connection error. ${BACKEND_HINT}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: 500, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
            <span style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>DKN</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', color: 'var(--navy)' }}>Knowledge Platform</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>Connect. Share. Optimize.</p>
        </div>

        {/* Auth Box */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 16px 48px rgba(2,6,23,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '40px' }}>
            <form onSubmit={handleLogin}>
              <h2 style={{ margin: '0 0 24px', color: 'var(--navy)', fontSize: '1.5rem' }}>Login</h2>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--navy)' }}>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--navy)' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>



              <button 
                type="submit"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: loading ? '#d1d5db' : 'var(--navy)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '16px',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1a3a5c' }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--navy)' }}
              >
                {loading ? '⏳ Loading...' : '🚀 Login'}
              </button>

              <div style={{ borderTop: '1px solid #e0e7ff', paddingTop: '16px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <p>Need an account? <strong>Contact your HR department or administrator</strong></p>
                <p style={{ fontSize: '0.8rem', margin: '8px 0 0' }}>New user accounts are created and managed by administrators for security and compliance</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
