import React, { useEffect, useState } from 'react'
import { fetchCommunities } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface Community {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: string
  members: number
  joinedMembers?: string[]
}

export default function Communities(){
  const [communities, setCommunities] = useState<Community[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [joinedGroups, setJoinedGroups] = useState<string[]>([])
  const { user, role } = useAuth()
  const { push } = useToast()

  const canCreate = role === 'Consultant' || role === 'KnowledgeChampion' || role === 'Administrator'
  const canJoin = true // All roles can join

  useEffect(() => {
    fetchCommunities().then((data: any) => {
      const formattedData = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        createdBy: c.createdBy || 'system',
        createdAt: c.createdAt || new Date().toLocaleDateString(),
        members: c.members || 0,
        joinedMembers: []
      }))
      setCommunities(formattedData)
    })
    // Load joined groups from localStorage
    try {
      const saved = localStorage.getItem(`dkn:joined-groups-${user?.id}`)
      if (saved) setJoinedGroups(JSON.parse(saved))
    } catch {}
  }, [user?.id])

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      push('Please enter a group name')
      return
    }

    const newCommunity: Community = {
      id: `group-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      createdBy: user?.name || 'Unknown',
      createdAt: new Date().toLocaleDateString(),
      members: 1,
      joinedMembers: [user?.id || '']
    }

    setCommunities([newCommunity, ...communities])
    setJoinedGroups([newCommunity.id, ...joinedGroups])
    localStorage.setItem(`dkn:joined-groups-${user?.id}`, JSON.stringify([newCommunity.id, ...joinedGroups]))
    push(`Group "${formData.name}" created successfully!`)
    setFormData({ name: '', description: '' })
    setShowCreate(false)
  }

  const handleJoinCommunity = (groupId: string, groupName: string) => {
    if (joinedGroups.includes(groupId)) {
      // Leave group
      const updated = joinedGroups.filter(id => id !== groupId)
      setJoinedGroups(updated)
      localStorage.setItem(`dkn:joined-groups-${user?.id}`, JSON.stringify(updated))
      setCommunities(communities.map(c => c.id === groupId ? { ...c, members: Math.max(1, c.members - 1) } : c))
      push(`You left "${groupName}"`)
    } else {
      // Join group
      const updated = [...joinedGroups, groupId]
      setJoinedGroups(updated)
      localStorage.setItem(`dkn:joined-groups-${user?.id}`, JSON.stringify(updated))
      setCommunities(communities.map(c => c.id === groupId ? { ...c, members: c.members + 1 } : c))
      push(`You joined "${groupName}"!`)
    }
  }

  return (
    <>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, color: 'var(--navy)' }}>Communities & Groups</h3>
          {canCreate && (
            <button onClick={() => setShowCreate(!showCreate)} style={{ padding: '10px 20px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
              {showCreate ? '✕ Close' : '+ Create Group'}
            </button>
          )}
        </div>

        {canCreate && showCreate && (
          <div className="card" style={{ background: '#f9fafb', padding: '24px', marginBottom: '24px', border: '2px solid var(--gold)' }}>
            <h4 style={{ marginTop: 0, color: 'var(--navy)' }}>Create New Group</h4>
            <form onSubmit={handleCreateCommunity}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Mobile Development Best Practices"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Description</label>
                <textarea
                  placeholder="Describe the purpose and focus of this group..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', minHeight: '100px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Create Group
                </button>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '12px 24px', background: '#e5e7eb', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!canCreate && (
          <div style={{ padding: '12px 16px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', marginBottom: '24px', color: '#92400e', fontSize: '0.9rem' }}>
            💡 <strong>{role}</strong> users can join groups. To create groups, upgrade to Consultant, Knowledge Champion, or Administrator role.
          </div>
        )}
      </section>

      <section>
        <h3 style={{ color: 'var(--navy)', marginBottom: 16 }}>
          {joinedGroups.length > 0 ? `👥 Your Groups (${joinedGroups.length})` : '👥 Browse Available Groups'}
        </h3>
        
        {communities.length === 0 ? (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
            <p>No groups available yet. {canCreate && 'Create the first one!'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {communities.map(community => {
              const isJoined = joinedGroups.includes(community.id)
              return (
                <div key={community.id} className="card" style={{ padding: '20px', background: isJoined ? '#e8f5e9' : 'white', borderLeft: isJoined ? '4px solid #34d399' : '4px solid #e0e7ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--navy)', fontSize: '1.1rem' }}>{community.name}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                        👤 Created by {community.createdBy} • 📅 {community.createdAt}
                      </div>
                    </div>
                  </div>

                  {community.description && (
                    <p style={{ margin: '12px 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{community.description}</p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>
                      👥 {community.members} {community.members === 1 ? 'member' : 'members'}
                    </div>
                    {canJoin && (
                      <button
                        onClick={() => handleJoinCommunity(community.id, community.name)}
                        style={{
                          padding: '8px 16px',
                          background: isJoined ? '#ef4444' : 'var(--gold)',
                          color: isJoined ? 'white' : 'var(--navy)',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        {isJoined ? '✓ Leave' : '+ Join'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
