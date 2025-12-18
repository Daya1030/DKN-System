import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, fetchDocuments, fetchNotifications } from '../api'

export default function Dashboard() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ projects: 0, documents: 0, notifications: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    let mounted = true
    Promise.all([fetchProjects(), fetchDocuments(), fetchNotifications()]).then(([p, d, n]) => {
      if (!mounted) return
      setStats({ projects: p.length, documents: d.length, notifications: n.length })
      setLoading(false)
    })
    return () => { mounted = false }
  }, [user, navigate])

  if (!user) return null

  const roleInfo: Record<string, { title: string; desc: string; icon: string; color: string; bgColor: string }> = {
    NewHire: { title: 'New Hire', desc: 'Get onboarded and explore', icon: '🎓', color: '#3b82f6', bgColor: '#eff6ff' },
    Consultant: { title: 'Senior Consultant', desc: 'Share knowledge and insights', icon: '💼', color: '#06b6d4', bgColor: '#ecf9ff' },
    KnowledgeChampion: { title: 'Knowledge Champion', desc: 'Lead and approve content', icon: '⭐', color: '#10b981', bgColor: '#ecfdf5' },
    Administrator: { title: 'Administrator', desc: 'Full system access', icon: '⚙️', color: '#f59e0b', bgColor: '#fffbeb' }
  }

  const info = roleInfo[role]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      {/* Welcome Header */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 100%)', padding: '40px 24px', marginBottom: '32px', borderRadius: '0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '24px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px', fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Welcome back, {user.name}! 👋</h1>
              <p style={{ margin: '0 0 16px', fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)' }}>
                {info.title} in {user.country}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                  {info.icon} {info.title}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                  📍 {user.country}
                </span>
              </div>
            </div>
            <div style={{ background: info.bgColor, borderRadius: '12px', padding: '24px', textAlign: 'center', minWidth: '180px', border: `2px solid ${info.color}` }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{info.icon}</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--navy)', fontWeight: 600 }}>{info.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>{info.desc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ background: 'white', padding: '60px 24px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>Loading your dashboard…</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px' }}>📊 Projects</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '8px' }}>{stats.projects}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>In {user.country}</div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px' }}>📄 Documents</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>{stats.documents}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Shared across all branches</div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px' }}>🔔 Notifications</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>{stats.notifications}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Recent updates</div>
              </div>
            </div>

            {/* Role-Specific Sections */}
            {role === 'NewHire' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>🎓 New Hire Onboarding</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Welcome to our organization! Here's how to get started:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📚 Explore Knowledge Base</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Browse approved documents and resources</div>
                  </div>
                  <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>👥 Join Communities</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Connect with peers and team members</div>
                  </div>
                  <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>❓ Ask Questions</div>
                    <div style={{ fontSize: '0.9rem', color: '#b45309' }}>Get help from Knowledge Champions</div>
                  </div>
                </div>
              </div>
            )}

            {role === 'Consultant' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>💼 Consultant Workspace</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Manage your projects and contribute knowledge</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#ecf9ff', borderLeft: '4px solid #06b6d4', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#0e7490', marginBottom: '8px' }}>📤 Upload Document</div>
                    <div style={{ fontSize: '0.9rem', color: '#155e75' }}>Share your expertise with the team</div>
                  </div>
                  <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>👥 Join/Create Groups</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Collaborate with colleagues</div>
                  </div>
                  <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📊 Track Projects</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Monitor your region's initiatives</div>
                  </div>
                </div>
              </div>
            )}

            {role === 'KnowledgeChampion' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>⭐ Knowledge Champion Hub</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Lead and govern knowledge sharing</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>✅ Approve Documents</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Review and approve submissions</div>
                  </div>
                  <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>🎓 Mentor Team</div>
                    <div style={{ fontSize: '0.9rem', color: '#b45309' }}>Guide others in best practices</div>
                  </div>
                  <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📈 Analytics</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Track knowledge base metrics</div>
                  </div>
                </div>
              </div>
            )}

            {role === 'Administrator' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>⚙️ Administrator Control</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Full system management access</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>👥 User Management</div>
                    <div style={{ fontSize: '0.9rem', color: '#b45309' }}>Register and manage user accounts</div>
                  </div>
                  <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: '8px' }}>🔐 System Security</div>
                    <div style={{ fontSize: '0.9rem', color: '#991b1b' }}>Control access and permissions</div>
                  </div>
                  <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>📊 Reports & Audit</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Monitor system activity</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button onClick={() => navigate('/documents')} style={{ padding: '16px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1a3a5c'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--navy)'}>
                  📚 View Documents
                </button>
                <button onClick={() => navigate('/communities')} style={{ padding: '16px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0b845'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gold)'}>
                  👥 Communities
                </button>
                <button onClick={() => navigate('/notifications')} style={{ padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#059669'} onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}>
                  🔔 Notifications
                </button>
                {role === 'Administrator' && (
                  <button onClick={() => navigate('/admin')} style={{ padding: '16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#d97706'} onMouseLeave={(e) => e.currentTarget.style.background = '#f59e0b'}>
                    ⚙️ Admin Panel
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
