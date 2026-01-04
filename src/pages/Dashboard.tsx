import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { fetchProjects, fetchDocuments, fetchNotifications } from '../api'

const getTimeAgo = (date: string | Date) => {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export default function Dashboard() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ projects: 0, documents: 0, notifications: 0 })
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([])
  const [recentQuestions, setRecentQuestions] = useState<any[]>([])
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
      
      // Get pending documents for Knowledge Champions/Admins
      if (role === 'KnowledgeChampion' || role === 'Administrator') {
        const pending = d.filter((doc: any) => doc.status === 'pending')
        setPendingDocuments(pending)
        
        // Load recent questions from localStorage
        try {
          const saved = localStorage.getItem('dkn:questions')
          if (saved) {
            const questions = JSON.parse(saved)
            const recent = questions
              .filter((q: any) => q.status === 'open')
              .sort((a: any, b: any) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime())
              .slice(0, 3)
            setRecentQuestions(recent)
          }
        } catch {}
      }
      
      setLoading(false)
    })
    return () => { mounted = false }
  }, [user, navigate, role])

  if (!user) return null

  const roleInfo: Record<string, { title: string; desc: string; icon: string; color: string; bgColor: string }> = {
    NewHire: { title: 'New Hire', desc: 'Get onboarded and explore', icon: '🎓', color: '#3b82f6', bgColor: '#eff6ff' },
    Consultant: { title: 'Consultant', desc: 'Share knowledge and insights', icon: '💼', color: '#06b6d4', bgColor: '#ecf9ff' },
    KnowledgeChampion: { title: 'Knowledge Champion', desc: 'Lead and approve content', icon: '⭐', color: '#10b981', bgColor: '#ecfdf5' },
    Administrator: { title: 'Administrator', desc: 'Full system access', icon: '⚙️', color: '#f59e0b', bgColor: '#fffbeb' }
  }

  const info = roleInfo[role]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      {/* Welcome Header */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 100%)', padding: '40px 24px', marginBottom: '32px', borderRadius: '0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Welcome back, {user.name}! 👋</h1>
          <p style={{ margin: '0', fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)' }}>
            {info.title} in {user.country}
          </p>
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
            {/* Stats Cards - Always show all three */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px', animation: 'fadeIn 0.3s ease-in' }}>
              <div onClick={() => navigate('/projects')} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px' }}>📊 Projects</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '8px' }}>{stats.projects}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>In {user.country}</div>
              </div>

              <div onClick={() => navigate('/documents')} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px' }}>📄 Documents</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>{stats.documents}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Shared across all branches</div>
              </div>

              <div onClick={() => navigate('/notifications')} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px' }}>🔔 Notifications</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>{stats.notifications}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Recent updates</div>
              </div>
            </div>

            {/* Empty State */}
            {stats.projects === 0 && stats.documents === 0 && stats.notifications === 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '60px 24px', textAlign: 'center', border: '2px dashed #e5e7eb', marginBottom: '32px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>Start Creating Content</div>
                <div style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: '24px' }}>
                  Projects, documents, and notifications will appear here once you create them
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {(role === 'Consultant' || role === 'KnowledgeChampion' || role === 'Administrator') && (
                    <button onClick={() => navigate('/documents')} style={{ padding: '10px 20px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                      📄 Upload Document
                    </button>
                  )}
                  {(role === 'KnowledgeChampion' || role === 'Administrator') && (
                    <button onClick={() => navigate('/projects')} style={{ padding: '10px 20px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                      📊 Create Project
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Role-Specific Sections */}
            {role === 'NewHire' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>🎓 New Hire Onboarding</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Welcome to our organization! Here's how to get started:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div onClick={() => navigate('/documents')} style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📚 Explore Knowledge Base</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Browse approved documents and resources</div>
                  </div>
                  <div onClick={() => navigate('/communities')} style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>👥 Join Communities</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Connect with peers and team members</div>
                  </div>
                  <div onClick={() => navigate('/questions')} style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>❓ Ask Questions</div>
                    <div style={{ fontSize: '0.9rem', color: '#b45309' }}>Get help from Knowledge Champions</div>
                  </div>
                </div>
                <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px', border: '1px solid #d1fae5', marginTop: '20px', color: '#065f46' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>ℹ️ About New Hire Onboarding</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Welcome to our organization! Use these resources to explore our knowledge base, connect with your team, and get answers to your questions. Our Knowledge Champions are here to help you succeed.
                  </div>
                </div>
              </div>
            )}

            {role === 'Consultant' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>💼 Consultant Workspace</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Manage your projects and contribute knowledge</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div onClick={() => navigate('/documents')} style={{ background: '#ecf9ff', borderLeft: '4px solid #06b6d4', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#0e7490', marginBottom: '8px' }}>📤 Upload Document</div>
                    <div style={{ fontSize: '0.9rem', color: '#155e75' }}>Share your expertise with the team</div>
                  </div>
                  <div onClick={() => navigate('/communities')} style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>👥 Join/Create Groups</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Collaborate with colleagues</div>
                  </div>
                  <div onClick={() => navigate('/projects')} style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📊 Track Projects</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Monitor your region's initiatives</div>
                  </div>
                  <div onClick={() => navigate('/consultant-chat')} style={{ background: '#ecf9ff', borderLeft: '4px solid #06b6d4', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#0e7490', marginBottom: '8px' }}>💼 Consultant Support</div>
                    <div style={{ fontSize: '0.9rem', color: '#155e75' }}>Chat with Knowledge Champions</div>
                  </div>
                </div>
                <div style={{ background: '#ecf9ff', borderRadius: '12px', padding: '16px', border: '1px solid #d1fae5', marginTop: '20px', color: '#0e7490' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>ℹ️ About Consultant Workspace</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Share your expertise by uploading documents, collaborate with teams through communities, and contribute to organizational knowledge. Connect with Knowledge Champions for guidance and feedback.
                  </div>
                </div>
              </div>
            )}

            {role === 'KnowledgeChampion' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>⭐ Knowledge Champion Hub</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Lead and govern knowledge sharing</p>
                
                {/* Action Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div onClick={() => navigate('/documents')} style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>✅ Approve Documents</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Review and approve submissions</div>
                  </div>
                  <div onClick={() => navigate('/questions')} style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>💬 Mentor Team</div>
                    <div style={{ fontSize: '0.9rem', color: '#b45309' }}>Answer questions from new hires</div>
                  </div>
                  <div onClick={() => navigate('/analytics')} style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>📈 Analytics</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Track knowledge base metrics</div>
                  </div>
                  <div onClick={() => navigate('/admin-chat')} style={{ background: '#f3e8ff', borderLeft: '4px solid #8b5cf6', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#6d28d9', marginBottom: '8px' }}>💬 Leadership Chat</div>
                    <div style={{ fontSize: '0.9rem', color: '#7c3aed' }}>Chat with administrators</div>
                  </div>
                  <div onClick={() => navigate('/consultant-chat')} style={{ background: '#ecf9ff', borderLeft: '4px solid #06b6d4', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#0e7490', marginBottom: '8px' }}>💼 Consultant Support</div>
                    <div style={{ fontSize: '0.9rem', color: '#155e75' }}>Support consultant inquiries</div>
                  </div>
                </div>

                {/* Pending Documents Section */}
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>📋 Pending Approvals ({pendingDocuments.length})</h3>
                  {pendingDocuments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                      <p style={{ margin: 0 }}>No pending approvals! Great work.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {pendingDocuments.slice(0, 3).map((doc: any) => (
                        <div key={doc.id} onClick={() => navigate('/documents')} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#fef3c7'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                          <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>{doc.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Submitted by {doc.uploadedBy || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>⏳ Pending</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {pendingDocuments.length > 3 && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <button onClick={() => navigate('/documents')} style={{ fontSize: '0.85rem', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        View all {pendingDocuments.length} pending documents →
                      </button>
                    </div>
                  )}
                </div>

                {/* Chat with New Hires */}
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>💬 Messages from New Hires</h3>
                  {recentQuestions.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px dashed #e5e7eb', padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                      No new messages. Check back soon!
                    </div>
                  ) : (
                    <>
                      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '12px', marginBottom: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                        {recentQuestions.map((q: any, idx: number) => (
                          <div key={q.id} style={{ marginBottom: idx < recentQuestions.length - 1 ? '12px' : '0', paddingBottom: idx < recentQuestions.length - 1 ? '12px' : '0', borderBottom: idx < recentQuestions.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                            <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9rem', marginBottom: '4px' }}>
                              {q.askedBy} <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>{getTimeAgo(q.askedAt)}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{q.question}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => navigate('/questions')} style={{ width: '100%', padding: '10px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                        📨 View All Messages
                      </button>
                    </>
                  )}
                </div>
                <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px', border: '1px solid #d1fae5', marginTop: '20px', color: '#065f46' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>ℹ️ About Knowledge Champion Hub</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    As a Knowledge Champion, you approve documents, mentor new hires, lead community discussions, and maintain organizational standards. Your leadership drives knowledge sharing excellence.
                  </div>
                </div>
              </div>
            )}

            {role === 'Administrator' && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>⚙️ Administrator Control</h2>
                <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '1rem' }}>Full system management access</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/admin')} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>👥 User Management</div>
                    <div style={{ fontSize: '0.9rem', color: '#b45309' }}>Register and manage user accounts</div>
                  </div>
                  <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/admin-chat')} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#7f1d1d', marginBottom: '8px' }}>💬 Leadership Chat</div>
                    <div style={{ fontSize: '0.9rem', color: '#991b1b' }}>Chat with Knowledge Champions</div>
                  </div>
                  <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/governance')} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>📊 Reports & Audit</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857' }}>Monitor system activity</div>
                  </div>
                  <div style={{ background: '#ecf9ff', borderLeft: '4px solid #06b6d4', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/consultant-chat')} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ fontWeight: 700, color: '#0e7490', marginBottom: '8px' }}>💼 Consultant Support</div>
                    <div style={{ fontSize: '0.9rem', color: '#155e75' }}>Oversee consultant operations</div>
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
