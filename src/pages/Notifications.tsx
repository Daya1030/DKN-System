import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

export default function Notifications(){
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { push } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return
    
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/notifications?user_id=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setNotes(data)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [user?.id])

  const handleNotificationClick = (notification: any) => {
    // Parse message to extract document or project reference
    if (notification.message.includes('Document') || notification.message.includes('document')) {
      // Try to find and navigate to document
      const docMatch = notification.message.match(/(\w+[\w\s]*)/i)
      if (docMatch) {
        push(`Navigating to document...`)
        // In real app, you'd fetch the doc by name and get its ID
      }
    } else if (notification.message.includes('Project') || notification.message.includes('project')) {
      push(`Navigating to project...`)
    } else {
      push(`📬 ${notification.message}`)
    }
  }

  return (
    <section>
      <h3 style={{ color: 'var(--navy)', marginBottom: 16 }}>🔔 Notifications</h3>
      {loading ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
          <p>Loading notifications...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {notes.map(n => (
            <div 
              key={n.id} 
              onClick={() => handleNotificationClick(n)}
              className="card" 
              style={{ 
                padding: '16px', 
                borderLeft: '4px solid var(--gold)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: 'white'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#f0f4f8'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'white'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateX(0)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    📅 {new Date(n.time).toLocaleString()}
                  </div>
                </div>
                <div style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>→</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
