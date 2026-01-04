import React, { useEffect, useState } from 'react'
import { fetchCommunities } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { notificationCreators, sendBroadcastNotification } from '../utils/notificationDecorator'

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
  const navigate = useNavigate()

  const canCreate = role === 'Administrator' // Only Admins can create groups
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
      localStorage.setItem('dkn:communities', JSON.stringify(formattedData))
    })
    // Load saved communities from localStorage
    try {
      const saved = localStorage.getItem('dkn:communities')
      if (saved) {
        const savedCommunities = JSON.parse(saved)
        setCommunities(savedCommunities)
      }
    } catch {}
    // Load joined groups from localStorage
    try {
      const saved = localStorage.getItem(`dkn:joined-groups-${user?.id}`)
      if (saved) setJoinedGroups(JSON.parse(saved))
    } catch {}
  }, [user?.id])

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      push('Please enter a group name')
      return
    }

    if (!user?.id) {
      push('❌ User not found')
      return
    }

    try {
      console.log('Creating community with user ID:', user.id, 'Type:', typeof user.id)
      const response = await fetch('http://localhost:5001/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          created_by_id: user.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create community')
      }

      const data = await response.json()
      
      // Create broadcast notification using decorator pattern
      try {
        const notification = notificationCreators
          .groupCreated(formData.name)
          .addDecorator(n => ({ ...n })) // Can chain more decorators if needed
          .build()
        
        await sendBroadcastNotification(notification.title, notification.message, notification.type)
      } catch (error) {
        console.error('Error creating notification:', error)
      }
      
      // Fetch updated communities list
      const updatedCommunities = await fetchCommunities()
      const formattedData = updatedCommunities.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        createdBy: c.created_by_id || 'system',
        createdAt: c.created_at || new Date().toLocaleDateString(),
        members: c.members_count || 0,
        joinedMembers: []
      }))
      setCommunities(formattedData)
      localStorage.setItem('dkn:communities', JSON.stringify(formattedData))
      
      // Auto-join creator
      const joinResponse = await fetch(`http://localhost:5001/api/communities/${data.community.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      })
      
      if (joinResponse.ok) {
        setJoinedGroups([data.community.id, ...joinedGroups])
        localStorage.setItem(`dkn:joined-groups-${user?.id}`, JSON.stringify([data.community.id, ...joinedGroups]))
      }
      
      push(`Group "${formData.name}" created successfully!`)
      setFormData({ name: '', description: '' })
      setShowCreate(false)
    } catch (error: any) {
      console.error('Create group error:', error)
      push(`❌ ${error.message || 'Failed to create group'}`)
    }
  }

  const handleJoinCommunity = (groupId: string, groupName: string) => {
    if (joinedGroups.includes(groupId)) {
      // Leave group
      const updated = joinedGroups.filter(id => id !== groupId)
      setJoinedGroups(updated)
      localStorage.setItem(`dkn:joined-groups-${user?.id}`, JSON.stringify(updated))
      const updatedCommunities = communities.map(c => c.id === groupId ? { ...c, members: Math.max(1, c.members - 1) } : c)
      setCommunities(updatedCommunities)
      localStorage.setItem('dkn:communities', JSON.stringify(updatedCommunities))
      push(`You left "${groupName}"`)
    } else {
      // Join group
      const updated = [...joinedGroups, groupId]
      setJoinedGroups(updated)
      localStorage.setItem(`dkn:joined-groups-${user?.id}`, JSON.stringify(updated))
      const updatedCommunities = communities.map(c => c.id === groupId ? { ...c, members: c.members + 1 } : c)
      setCommunities(updatedCommunities)
      localStorage.setItem('dkn:communities', JSON.stringify(updatedCommunities))
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
            💡 <strong>{role}</strong> users can join groups. Only Administrators can create new groups.
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
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/group/${community.id}`)}>
                      <h4 style={{ margin: '0 0 4px', color: 'var(--navy)', fontSize: '1.1rem', transition: 'color 0.2s', textDecoration: 'underline' }}>{community.name}</h4>
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
