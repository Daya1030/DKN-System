import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    branch: '',
    country: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Load profile data from localStorage or use user data
    try {
      const saved = localStorage.getItem('dkn:profile')
      if (saved) {
        const profile = JSON.parse(saved)
        setFormData(profile)
      } else {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          address: localStorage.getItem('dkn:address') || '',
          branch: localStorage.getItem('dkn:branch') || '',
          country: user.country || ''
        })
      }
    } catch {}
  }, [user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    try {
      localStorage.setItem('dkn:profile', JSON.stringify(formData))
      localStorage.setItem('dkn:address', formData.address)
      localStorage.setItem('dkn:branch', formData.branch)
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch {}
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleSavePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' })
      return
    }
    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: 'New password is required' })
      return
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update localStorage with new password
        localStorage.setItem('dkn:accountPassword', passwordData.newPassword)
        setMessage({ type: 'success', text: 'Password changed successfully! Logging you out...' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setIsChangingPassword(false)
        // Redirect to login after 2 seconds to force re-authentication
        setTimeout(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('dkn:user')
          navigate('/login')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch (error) {
      console.error('Change password error:', error)
      setMessage({ type: 'error', text: 'Connection error. Try again.' })
    }
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '24px',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        >
          ← Back to Dashboard
        </button>

        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              👤
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: '1.8rem', fontWeight: 800 }}>
              {formData.name}
            </h1>
            <p style={{ margin: 0, opacity: 0.9 }}>{formData.email}</p>
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            {/* Messages */}
            {message && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
                border: `2px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
                fontSize: '0.95rem'
              }}>
                {message.type === 'success' ? '✓' : '✕'} {message.text}
              </div>
            )}

            {isChangingPassword ? (
              <>
                {/* Change Password Form */}
                <form style={{ display: 'grid', gap: '16px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: 700, color: '#333' }}>
                    🔐 Change Password
                  </h3>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={handleSavePassword}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      ✓ Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      style={{
                        padding: '12px',
                        background: '#f3f4f6',
                        color: '#333',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e7eb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f3f4f6'
                      }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : isEditing ? (
              <>
                {/* Edit Form */}
                <form style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      Branch
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="Enter your branch"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={handleSave}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      ✓ Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      style={{
                        padding: '12px',
                        background: '#f3f4f6',
                        color: '#333',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e7eb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f3f4f6'
                      }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: '#667eea', textTransform: 'uppercase' }}>
                      Email
                    </p>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
                      {formData.email}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: '#667eea', textTransform: 'uppercase' }}>
                      Address
                    </p>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: formData.address ? '#333' : '#999' }}>
                      {formData.address || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: '#667eea', textTransform: 'uppercase' }}>
                      Branch
                    </p>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: formData.branch ? '#333' : '#999' }}>
                      {formData.branch || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: '#667eea', textTransform: 'uppercase' }}>
                      Country
                    </p>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
                      {formData.country}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '1rem',
                      marginTop: '16px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    style={{
                      padding: '12px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '1rem',
                      marginTop: '12px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    🔐 Change Password
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
