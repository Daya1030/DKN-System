import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'

interface Message {
  id: string
  senderName: string
  senderRole: string
  senderEmail: string
  message: string
  timestamp: string
}

export default function ConsultantChat() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const { push } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const canAccess = role === 'Consultant' || role === 'KnowledgeChampion' || role === 'Administrator'

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!canAccess) {
      navigate('/dashboard')
      push('❌ You do not have access to this chat')
      return
    }

    // Load messages from localStorage
    try {
      const saved = localStorage.getItem('dkn:consultant-chat')
      if (saved) {
        setMessages(JSON.parse(saved))
      }
    } catch {}
    setLoading(false)
  }, [user, navigate, canAccess, push])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      push('❌ Please enter a message')
      return
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderName: user?.name || 'Unknown',
      senderRole: role,
      senderEmail: user?.email || 'unknown@email.com',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    const updated = [...messages, message]
    setMessages(updated)
    localStorage.setItem('dkn:consultant-chat', JSON.stringify(updated))
    setNewMessage('')
    push('✓ Message sent')
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString()
    }
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 365) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (!canAccess) return null
  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: '40px 24px', marginBottom: '32px', borderRadius: '0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '16px',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 800, color: 'white' }}>
            💼 Consultant Support
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)' }}>
            Direct communication between Consultants and Knowledge Champions
          </p>
        </div>
      </section>

      {/* Chat Container */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '70vh',
          border: '1px solid #e5e7eb'
        }}>
          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: '#f9fafb'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted)' }}>
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💼</div>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((msg) => {
                  const isCurrentUser = msg.senderEmail === user?.email
                  const getRoleColor = () => {
                    if (msg.senderRole === 'Administrator') return '#f59e0b'
                    if (msg.senderRole === 'KnowledgeChampion') return '#10b981'
                    return '#06b6d4'
                  }
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '65%',
                          background: isCurrentUser ? getRoleColor() : '#ffffff',
                          color: isCurrentUser ? 'white' : '#333',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: isCurrentUser ? 'none' : '1px solid #e5e7eb',
                          boxShadow: isCurrentUser ? `0 2px 8px rgba(${getRoleColor() === '#f59e0b' ? '245,158,11' : getRoleColor() === '#10b981' ? '16,185,129' : '6,182,212'}, 0.2)` : '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          marginBottom: '4px',
                          opacity: 0.9
                        }}>
                          {msg.senderName}
                          <span style={{
                            fontSize: '0.75rem',
                            marginLeft: '8px',
                            opacity: 0.7,
                            fontWeight: 600
                          }}>
                            {msg.senderRole === 'Administrator' ? '⚙️ Admin' : msg.senderRole === 'KnowledgeChampion' ? '⭐ KC' : '👔 Consultant'}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '0.95rem',
                          lineHeight: '1.4',
                          marginBottom: '8px'
                        }}>
                          {msg.message}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          opacity: 0.7,
                          textAlign: 'right'
                        }}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '16px 24px',
            background: 'white'
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Send 📤
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  )
}
