import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'

interface Question {
  id: string
  askedBy: string
  askedById: string
  userRole: string
  question: string
  askedAt: string
  replies: Reply[]
  status: 'open' | 'answered'
}

interface Reply {
  id: string
  repliedBy: string
  repliedById: string
  replyRole: string
  reply: string
  repliedAt: string
}

export default function Questions() {
  const { user, role } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newReply, setNewReply] = useState('')

  const isKnowledgeExpert = role === 'KnowledgeChampion' || role === 'Administrator'

  useEffect(() => {
    // Load questions from localStorage
    try {
      const saved = localStorage.getItem('dkn:questions')
      if (saved) {
        setQuestions(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || !user) return

    const question: Question = {
      id: `q-${Date.now()}`,
      askedBy: user.name,
      askedById: user.id || '',
      userRole: role,
      question: newQuestion,
      askedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replies: [],
      status: 'open'
    }

    const updated = [question, ...questions]
    setQuestions(updated)
    localStorage.setItem('dkn:questions', JSON.stringify(updated))
    setNewQuestion('')
    push('Question posted successfully!')
  }

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim() || !user || !selectedQuestion) return

    const reply: Reply = {
      id: `r-${Date.now()}`,
      repliedBy: user.name,
      repliedById: user.id || '',
      replyRole: role,
      reply: newReply,
      repliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updated = questions.map(q =>
      q.id === selectedQuestion.id
        ? {
            ...q,
            replies: [...q.replies, reply],
            status: 'answered' as const
          }
        : q
    )
    setQuestions(updated)
    localStorage.setItem('dkn:questions', JSON.stringify(updated))
    setSelectedQuestion({ ...selectedQuestion, replies: [...selectedQuestion.replies, reply], status: 'answered' })
    setNewReply('')
    push('Reply posted successfully!')
  }

  if (!isKnowledgeExpert && role !== 'NewHire') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted)' }}>
        <p>Questions section is available for NewHires and Knowledge Experts.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 100%)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 800, color: 'white' }}>❓ Questions & Answers</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
            {isKnowledgeExpert ? 'Help NewHires by answering their questions' : 'Ask our Knowledge Champions for help'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isKnowledgeExpert ? '1fr 1fr' : '1fr', gap: '24px' }}>
          {/* Questions List */}
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.3rem', fontWeight: 700, color: 'var(--navy)' }}>
              {isKnowledgeExpert ? '📋 Questions to Answer' : '❓ Your Questions'}
            </h2>

            {!isKnowledgeExpert && (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>Ask a Question</h3>
                <form onSubmit={handleAskQuestion}>
                  <textarea
                    placeholder="Type your question here..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      minHeight: '100px',
                      fontFamily: 'inherit',
                      marginBottom: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
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
                    Post Question
                  </button>
                </form>
              </div>
            )}

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '12px', padding: '32px', textAlign: 'center', border: '1px solid #e5e7eb', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                  <p>{isKnowledgeExpert ? 'No questions yet' : 'No questions posted yet'}</p>
                </div>
              ) : (
                questions
                  .filter(q => isKnowledgeExpert || q.askedById === user?.id)
                  .map(q => (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      style={{
                        background: selectedQuestion?.id === q.id ? 'var(--gold)' : 'white',
                        borderRadius: '12px',
                        padding: '16px',
                        border: `2px solid ${selectedQuestion?.id === q.id ? 'var(--navy)' : '#e5e7eb'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: selectedQuestion?.id === q.id ? '0 8px 16px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedQuestion?.id !== q.id) {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedQuestion?.id !== q.id) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: selectedQuestion?.id === q.id ? 'var(--navy)' : 'var(--navy)', fontSize: '0.9rem' }}>
                          {q.askedBy}
                        </div>
                        <span
                          style={{
                            padding: '4px 8px',
                            background: q.status === 'answered' ? '#d1fae5' : '#fef3c7',
                            color: q.status === 'answered' ? '#047857' : '#92400e',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {q.status === 'answered' ? '✓ Answered' : '⏳ Open'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px', color: selectedQuestion?.id === q.id ? 'var(--navy)' : 'var(--muted)', fontSize: '0.9rem' }}>
                        {q.question}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: selectedQuestion?.id === q.id ? 'rgba(0,0,0,0.6)' : 'var(--muted)' }}>
                        {q.askedAt} • {q.replies.length} {q.replies.length === 1 ? 'reply' : 'replies'}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Answer Panel */}
          {selectedQuestion && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>
                Question from {selectedQuestion.askedBy}
              </h3>

              {/* Question Display */}
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #3b82f6' }}>
                <p style={{ margin: 0, color: 'var(--navy)', fontSize: '0.95rem' }}>{selectedQuestion.question}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>
                  {selectedQuestion.askedAt}
                </div>
              </div>

              {/* Replies */}
              {selectedQuestion.replies.length > 0 && (
                <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)' }}>
                    Replies ({selectedQuestion.replies.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedQuestion.replies.map(reply => (
                      <div key={reply.id} style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #34d399' }}>
                        <div style={{ fontWeight: 700, color: '#047857', fontSize: '0.85rem', marginBottom: '4px' }}>
                          {reply.repliedBy}
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: '8px' }}>({reply.replyRole})</span>
                        </div>
                        <p style={{ margin: '0', color: 'var(--navy)', fontSize: '0.9rem' }}>{reply.reply}</p>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>{reply.repliedAt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form - Only for Knowledge Experts */}
              {isKnowledgeExpert && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)' }}>
                    Your Reply
                  </h4>
                  <form onSubmit={handleAddReply}>
                    <textarea
                      placeholder="Type your answer here..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        minHeight: '80px',
                        fontFamily: 'inherit',
                        marginBottom: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '10px 20px',
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
                      Post Reply
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
