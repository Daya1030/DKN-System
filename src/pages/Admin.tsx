import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface User {
  id: string
  name: string
  email: string
  role: string
  country: string
  joinDate: string
  status: 'active' | 'inactive'
}

export default function Admin() {
  const { user, role } = useAuth()
  const { push } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'documents' | 'communities'>('overview')
  const [showUserForm, setShowUserForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Consultant', country: 'North America', status: 'active' })

  useEffect(() => {
    // Load users
    try {
      const saved = localStorage.getItem('dkn:admin-users')
      if (saved) setUsers(JSON.parse(saved))
    } catch {}

    // Load documents
    try {
      const saved = localStorage.getItem('dkn:uploaded-docs')
      if (saved) setUploadedDocs(JSON.parse(saved))
    } catch {}

    // Load communities
    try {
      const saved = localStorage.getItem('dkn:communities')
      if (saved) setCommunities(JSON.parse(saved))
    } catch {}
  }, [])

  const pendingDocs = uploadedDocs.filter(d => d.status === 'pending')
  const approvedDocs = uploadedDocs.filter(d => d.status === 'approved')

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalDocuments: uploadedDocs.length,
    approvedDocs: approvedDocs.length,
    pendingApprovals: pendingDocs.length,
    totalCommunities: communities.length
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) {
      push('Please fill in all fields')
      return
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      country: newUser.country,
      joinDate: new Date().toLocaleDateString(),
      status: 'active'
    }

    const updated = [...users, user]
    setUsers(updated)
    localStorage.setItem('dkn:admin-users', JSON.stringify(updated))

    // Also save to registered users for login
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('dkn:registered-users') || '{}')
      registeredUsers[newUser.email] = {
        password: 'temppass123',
        name: newUser.name,
        role: newUser.role,
        country: newUser.country
      }
      localStorage.setItem('dkn:registered-users', JSON.stringify(registeredUsers))
    } catch {}

    push(`✓ User "${newUser.name}" registered! | Temp password: temppass123`)
    setNewUser({ name: '', email: '', role: 'Consultant', country: 'North America', status: 'active' })
    setShowUserForm(false)
  }

  const handleDeactivateUser = (userId: string, userName: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, status: 'inactive' as const } : u)
    setUsers(updated)
    localStorage.setItem('dkn:admin-users', JSON.stringify(updated))
    push(`User "${userName}" deactivated`)
  }

  const handleActivateUser = (userId: string, userName: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, status: 'active' as const } : u)
    setUsers(updated)
    localStorage.setItem('dkn:admin-users', JSON.stringify(updated))
    push(`User "${userName}" activated`)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'NewHire': '#3b82f6',
      'Consultant': '#06b6d4',
      'KnowledgeChampion': '#10b981',
      'Administrator': '#f59e0b'
    }
    return colors[role] || '#6b7280'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      {/* Header */}
      <section style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '32px 24px', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2.5rem', fontWeight: 800, color: 'var(--navy)' }}>⚙️ Admin Control Center</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '1rem' }}>System management and governance oversight</p>
      </section>

      {/* Stats Cards */}
      <section style={{ padding: '0 24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>👥 Total Users</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '8px' }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{stats.activeUsers} active users</div>
          </div>

          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>📄 Total Documents</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>{stats.totalDocuments}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{stats.approvedDocs} approved</div>
          </div>

          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>⏳ Pending Approvals</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>{stats.pendingApprovals}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Awaiting review</div>
          </div>

          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>🤝 Communities</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '8px' }}>{stats.totalCommunities}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Active groups</div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section style={{ padding: '0 24px', marginBottom: '32px', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['overview', 'users', 'documents', 'communities'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '12px 20px',
                background: activeTab === tab ? 'var(--navy)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--muted)',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.background = '#f3f4f6' }}
              onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.background = 'transparent' }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'users' && '👥 Users'}
              {tab === 'documents' && '📄 Documents'}
              {tab === 'communities' && '🤝 Communities'}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 24px' }}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px', color: 'var(--navy)', fontSize: '1.2rem' }}>System Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>✓ All Systems</div>
                  <div style={{ fontSize: '0.85rem', color: '#059669' }}>Operational</div>
                </div>
                <div style={{ padding: '16px', background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>✓ Database</div>
                  <div style={{ fontSize: '0.85rem', color: '#059669' }}>Connected</div>
                </div>
                <div style={{ padding: '16px', background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#047857', marginBottom: '4px' }}>✓ Authentication</div>
                  <div style={{ fontSize: '0.85rem', color: '#059669' }}>Secure</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: '1.2rem' }}>User Management ({stats.totalUsers} users)</h3>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                style={{
                  padding: '10px 20px',
                  background: showUserForm ? '#ef4444' : 'var(--gold)',
                  color: showUserForm ? 'white' : 'var(--navy)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {showUserForm ? '✕ Close' : '+ Register User'}
              </button>
            </div>

            {showUserForm && (
              <div style={{ background: 'white', border: '2px solid var(--gold)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--navy)', fontSize: '1.1rem' }}>Register New User</h4>
                <p style={{ margin: '0 0 20px', color: 'var(--muted)', fontSize: '0.9rem' }}>Create user account and assign role</p>
                <form onSubmit={handleAddUser}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                      style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500' }}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500' }}
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500' }}
                    >
                      <option value="NewHire">New Hire (Onboarding)</option>
                      <option value="Consultant">Senior Consultant (Document Upload)</option>
                      <option value="KnowledgeChampion">Knowledge Champion (Approval)</option>
                      <option value="Administrator">Administrator (Full Control)</option>
                    </select>
                    <select
                      value={newUser.country}
                      onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
                      style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500' }}
                    >
                      <option value="North America">North America</option>
                      <option value="Europe">Europe</option>
                      <option value="Asia">Asia</option>
                    </select>
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
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1a3a5c')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy)')}
                  >
                    Register User
                  </button>
                </form>
              </div>
            )}

            {/* Users List */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              {users.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                  No users registered yet. Click "+ Register User" to add users.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>Name</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>Email</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>Role</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>Country</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>Status</th>
                        <th style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr key={u.id} style={{ borderBottom: idx < users.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                          <td style={{ padding: '16px', color: 'var(--navy)', fontWeight: 600 }}>{u.name}</td>
                          <td style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.9rem' }}>{u.email}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ background: getRoleBadgeColor(u.role), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.9rem' }}>{u.country}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ background: u.status === 'active' ? '#ecfdf5' : '#fef2f2', color: u.status === 'active' ? '#059669' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {u.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {u.status === 'active' ? (
                              <button
                                onClick={() => handleDeactivateUser(u.id, u.name)}
                                style={{ padding: '6px 12px', background: '#fecaca', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(u.id, u.name)}
                                style={{ padding: '6px 12px', background: '#d1fae5', color: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div>
            <h3 style={{ margin: '0 0 24px', color: 'var(--navy)', fontSize: '1.2rem' }}>Document Management ({stats.totalDocuments} docs)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>{stats.totalDocuments}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Total Documents</div>
              </div>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6', marginBottom: '8px' }}>{stats.approvedDocs}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Approved</div>
              </div>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>{stats.pendingApprovals}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Pending</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              {uploadedDocs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No documents yet</div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {uploadedDocs.map(doc => (
                    <div key={doc.id} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>{doc.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Uploaded by {doc.uploadedBy} • {doc.uploadDate}</div>
                        </div>
                        <span style={{ background: doc.status === 'approved' ? '#d1fae5' : doc.status === 'rejected' ? '#fecaca' : '#fef3c7', color: doc.status === 'approved' ? '#059669' : doc.status === 'rejected' ? '#dc2626' : '#b45309', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMMUNITIES TAB */}
        {activeTab === 'communities' && (
          <div>
            <h3 style={{ margin: '0 0 24px', color: 'var(--navy)', fontSize: '1.2rem' }}>Communities ({stats.totalCommunities} groups)</h3>
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              {communities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No communities yet</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                  {communities.map(comm => (
                    <div key={comm.id} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>{comm.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '8px' }}>Members: {comm.members?.length || 0}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Created by {comm.createdBy}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
