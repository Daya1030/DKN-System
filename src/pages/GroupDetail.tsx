import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface GroupMessage {
  id: string
  sender: string
  senderId: string
  message: string
  timestamp: string
  avatar?: string
}

interface Group {
  id: string
  name: string
  description: string
  createdBy: string
  members: number
  joinedMembers?: string[]
}

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const { push } = useToast()

  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [voiceActive, setVoiceActive] = useState(false)
  const [videoActive, setVideoActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'video'>('chat')

  // Check if user can start voice/video calls
  const canStartCall = role === 'Consultant' || role === 'KnowledgeChampion' || role === 'Administrator'
  const canJoinCall = role === 'NewHire' && (voiceActive || videoActive)

  useEffect(() => {
    // Load group from API first
    const loadGroup = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/communities/${groupId}`)
        if (response.ok) {
          const data = await response.json()
          setGroup({
            id: data.id,
            name: data.name,
            description: data.description || '',
            createdBy: data.created_by_id || 'system',
            members: data.members_count || 0,
            joinedMembers: []
          })
        } else {
          // Fallback to localStorage if API fails
          try {
            const saved = localStorage.getItem('dkn:communities')
            if (saved) {
              const communities = JSON.parse(saved)
              const found = communities.find((c: any) => c.id === groupId)
              if (found) {
                setGroup(found)
              }
            }
          } catch {}
        }
      } catch (error) {
        console.error('Error loading group:', error)
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem('dkn:communities')
          if (saved) {
            const communities = JSON.parse(saved)
            const found = communities.find((c: any) => c.id === groupId)
            if (found) {
              setGroup(found)
            }
          }
        } catch {}
      }
    }

    if (groupId) {
      loadGroup()
    }

    // Load chat messages from localStorage
    try {
      const saved = localStorage.getItem(`dkn:group-messages-${groupId}`)
      if (saved) {
        setMessages(JSON.parse(saved))
      }
    } catch {}
  }, [groupId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: GroupMessage = {
      id: `msg-${Date.now()}`,
      sender: user.name,
      senderId: user.id || '',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updated = [...messages, message]
    setMessages(updated)
    localStorage.setItem(`dkn:group-messages-${groupId}`, JSON.stringify(updated))
    setNewMessage('')
    push('Message sent!')
  }

  const handleStartVoice = () => {
    if (role === 'NewHire') {
      push('📱 Only Consultants, Knowledge Champions, and Administrators can start voice calls. Waiting for someone to start...')
      return
    }
    setVoiceActive(!voiceActive)
    push(voiceActive ? '📱 Voice call ended' : '📱 Voice call started')
  }

  const handleStartVideo = () => {
    if (role === 'NewHire') {
      push('📹 Only Consultants, Knowledge Champions, and Administrators can start video calls. Waiting for someone to start...')
      return
    }
    setVideoActive(!videoActive)
    push(videoActive ? '📹 Video call ended' : '📹 Video call started')
  }

  if (!group) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted)' }}>
        <p>Group not found. <button onClick={() => navigate('/communities')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }}>Back to Communities</button></p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 100%)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button onClick={() => navigate('/communities')} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
            ← Back to Communities
          </button>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 800, color: 'white' }}>{group.name}</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>👥 {group.members} members</p>
          {group.description && (
            <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{group.description}</p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'chat' ? 'var(--gold)' : 'transparent',
              color: activeTab === 'chat' ? 'var(--navy)' : 'var(--muted)',
              border: 'none',
              borderBottom: activeTab === 'chat' ? '3px solid var(--navy)' : 'none',
              fontWeight: activeTab === 'chat' ? 700 : 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'voice' ? 'var(--gold)' : 'transparent',
              color: activeTab === 'voice' ? 'var(--navy)' : 'var(--muted)',
              border: 'none',
              borderBottom: activeTab === 'voice' ? '3px solid var(--navy)' : 'none',
              fontWeight: activeTab === 'voice' ? 700 : 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            📱 Voice Call
          </button>
          <button
            onClick={() => setActiveTab('video')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'video' ? 'var(--gold)' : 'transparent',
              color: activeTab === 'video' ? 'var(--navy)' : 'var(--muted)',
              border: 'none',
              borderBottom: activeTab === 'video' ? '3px solid var(--navy)' : 'none',
              fontWeight: activeTab === 'video' ? 700 : 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s'
            }}
          >
            📹 Video Call
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {/* Messages Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '60px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '70%',
                        background: msg.senderId === user?.id ? 'var(--gold)' : '#f3f4f6',
                        color: msg.senderId === user?.id ? 'var(--navy)' : 'var(--navy)',
                        padding: '12px 16px',
                        borderRadius: msg.senderId === user?.id ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        wordWrap: 'break-word'
                      }}
                    >
                      {msg.senderId !== user?.id && (
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px', color: 'var(--navy)' }}>
                          {msg.sender}
                        </div>
                      )}
                      <div style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{msg.message}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{msg.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'var(--gold)',
                    color: 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Voice Call Tab */}
        {activeTab === 'voice' && (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📱</div>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.5rem', color: 'var(--navy)' }}>Voice Call</h3>
            
            {canStartCall ? (
              <>
                <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                  {voiceActive ? 'Voice call is active. Click below to end the call.' : 'Start a voice call with your group members.'}
                </p>
                <button
                  onClick={handleStartVoice}
                  style={{
                    padding: '16px 32px',
                    background: voiceActive ? '#ef4444' : 'var(--gold)',
                    color: voiceActive ? 'white' : 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {voiceActive ? '🛑 End Voice Call' : '▶️ Start Voice Call'}
                </button>
                {voiceActive && (
                  <div style={{ marginTop: '32px', padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #34d399' }}>
                    <div style={{ fontSize: '0.95rem', color: '#047857', fontWeight: 600 }}>
                      ✓ Voice call connected with {group.members} {group.members === 1 ? 'member' : 'members'}
                    </div>
                  </div>
                )}
              </>
            ) : voiceActive ? (
              <>
                <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                  A voice call is in progress. You can join now!
                </p>
                <button
                  onClick={handleStartVoice}
                  style={{
                    padding: '16px 32px',
                    background: 'var(--gold)',
                    color: 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  ✓ Join Voice Call
                </button>
              </>
            ) : (
              <p style={{ color: '#ef4444', fontSize: '1.05rem', fontWeight: 600 }}>
                📱 Only Consultants, Knowledge Champions, and Administrators can start voice calls. Waiting for someone to start...
              </p>
            )}
          </div>
        )}

        {/* Video Call Tab */}
        {activeTab === 'video' && (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📹</div>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.5rem', color: 'var(--navy)' }}>Video Call</h3>
            
            {canStartCall ? (
              <>
                <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                  {videoActive ? 'Video call is active. Click below to end the call.' : 'Start a video call with your group members.'}
                </p>
                <button
                  onClick={handleStartVideo}
                  style={{
                    padding: '16px 32px',
                    background: videoActive ? '#ef4444' : 'var(--gold)',
                    color: videoActive ? 'white' : 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {videoActive ? '🛑 End Video Call' : '▶️ Start Video Call'}
                </button>
                {videoActive && (
                  <div style={{ marginTop: '32px', padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #34d399' }}>
                    <div style={{ fontSize: '0.95rem', color: '#047857', fontWeight: 600 }}>
                      ✓ Video call connected with {group.members} {group.members === 1 ? 'member' : 'members'}
                    </div>
                  </div>
                )}
              </>
            ) : videoActive ? (
              <>
                <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
                  A video call is in progress. You can join now!
                </p>
                <button
                  onClick={handleStartVideo}
                  style={{
                    padding: '16px 32px',
                    background: 'var(--gold)',
                    color: 'var(--navy)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  ✓ Join Video Call
                </button>
              </>
            ) : (
              <p style={{ color: '#ef4444', fontSize: '1.05rem', fontWeight: 600 }}>
                📹 Only Consultants, Knowledge Champions, and Administrators can start video calls. Waiting for someone to start...
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
