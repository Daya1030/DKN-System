import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const COUNTRIES = ['North America', 'Europe', 'Asia']

// Dummy credentials for testing
let DUMMY_USERS: Record<string, { password: string; name: string; role: 'NewHire' | 'Consultant' | 'KnowledgeChampion' | 'Administrator'; country: string }> = {
  'admin@dkn.com': { password: 'admin123', name: 'Admin User', role: 'Administrator', country: 'North America' },
  'champion@dkn.com': { password: 'champion123', name: 'Knowledge Champion', role: 'KnowledgeChampion', country: 'Europe' },
  'consultant@dkn.com': { password: 'consultant123', name: 'Senior Consultant', role: 'Consultant', country: 'Asia' },
  'newhire@dkn.com': { password: 'newhire123', name: 'New Hire', role: 'NewHire', country: 'North America' }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { push } = useToast()
  const [mfaEnabled, setMfaEnabled] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginCountry, setLoginCountry] = useState('North America')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword || !loginCountry) {
      push('Please fill all fields')
      return
    }
    
    // Load registered users from localStorage
    try {
      const registered = localStorage.getItem('dkn:registered-users')
      if (registered) {
        DUMMY_USERS = { ...DUMMY_USERS, ...JSON.parse(registered) }
      }
    } catch {}
    
    // Check credentials
    const user = DUMMY_USERS[loginEmail]
    if (!user || user.password !== loginPassword) {
      push('Invalid email or password')
      return
    }
    
    if (mfaEnabled) {
      push('MFA verification sent to email (demo mode - auto-verified)')
    }
    
    login(user.name, loginEmail, loginCountry, user.role)
    push(`Welcome ${user.name}! Logged in as ${user.role}`)
    navigate('/dashboard')
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
              <h2 style={{ margin: '0 0 24px', color: 'var(--navy)', fontSize: '1.5rem' }}>Sign In</h2>

              <div style={{ background: '#f0f4f8', border: '1px solid #d0d9e8', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--navy)' }}>
                <strong>Test Credentials:</strong>
                <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  <div>admin@dkn.com / admin123</div>
                  <div>champion@dkn.com / champion123</div>
                  <div>consultant@dkn.com / consultant123</div>
                  <div>newhire@dkn.com / newhire123</div>
                </div>
              </div>

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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--navy)' }}>Your Country</label>
                <select
                  value={loginCountry}
                  onChange={(e) => setLoginCountry(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--navy)', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                  />
                  Enable MFA (Multi-Factor Authentication)
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '8px 0 0' }}>Recommended for enhanced security</p>
              </div>

              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: 'var(--navy)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a3a5c')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}
              >
                Sign In
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
