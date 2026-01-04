import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProjects } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface Project {
  id: string
  name: string
  description: string
  plan: string
  createdBy: string
  createdAt: string
  status: 'active' | 'archived'
}

export default function Projects(){
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', plan: '' })
  const { role, user } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  const canAddProject = role === 'KnowledgeChampion' || role === 'Administrator'

  useEffect(() => {
    fetchProjects().then((apiProjects: any[]) => {
      // Convert API projects to our Project format
      const convertedProjects = apiProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        plan: p.plan || 'General',
        createdBy: p.createdBy || 'System',
        createdAt: p.createdAt || new Date().toLocaleDateString(),
        status: 'active' as const
      }))
      setProjects(convertedProjects)
    })
    // Load custom projects from localStorage
    try {
      const saved = localStorage.getItem('dkn:projects')
      if (saved) {
        const savedProjects = JSON.parse(saved)
        setProjects(prev => [...prev, ...savedProjects])
      }
    } catch {}
  }, [])

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.plan) {
      push('Please fill in all fields')
      return
    }

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: formData.title,
      description: formData.description,
      plan: formData.plan,
      createdBy: user?.name || 'Unknown',
      createdAt: new Date().toLocaleDateString(),
      status: 'active'
    }

    const customProjects = projects.filter(p => p.id.startsWith('project-'))
    const updated = [newProject, ...customProjects]
    
    // Save only custom projects to localStorage
    localStorage.setItem('dkn:projects', JSON.stringify(updated))
    
    setProjects([newProject, ...projects])
    push(`Project "${formData.title}" created successfully!`)
    setFormData({ title: '', description: '', plan: '' })
    setShowForm(false)
  }

  const handleDeleteProject = (projectId: string, projectName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)
    if (!confirmed) return

    // Remove from projects state
    const updated = projects.filter(p => p.id !== projectId)
    setProjects(updated)

    // Remove from localStorage if it's a custom project
    if (projectId.startsWith('project-')) {
      const customProjects = updated.filter(p => p.id.startsWith('project-'))
      localStorage.setItem('dkn:projects', JSON.stringify(customProjects))
    }

    push(`✅ Project "${projectName}" deleted successfully`)
  }

  return (
    <>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, color: 'var(--navy)' }}>Projects</h3>
          {canAddProject && (
            <button 
              onClick={() => setShowForm(!showForm)} 
              style={{ padding: '10px 20px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} 
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} 
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {showForm ? '✕ Close' : '+ Add Project'}
            </button>
          )}
        </div>

        {showForm && canAddProject && (
          <div className="card" style={{ background: '#f9fafb', padding: '24px', marginBottom: '24px', border: '2px solid var(--gold)' }}>
            <h4 style={{ marginTop: 0, color: 'var(--navy)' }}>Create New Project</h4>
            <form onSubmit={handleAddProject}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Mobile App Modernization"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', 
                    boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Description *</label>
                <textarea
                  placeholder="Add a detailed description of the project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', 
                    minHeight: '100px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Project Plan *</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', 
                    boxSizing: 'border-box' }}
                >
                  <option value="">Select a plan...</option>
                  <option value="Q1">Q1 - First Quarter</option>
                  <option value="Q2">Q2 - Second Quarter</option>
                  <option value="Q3">Q3 - Third Quarter</option>
                  <option value="Q4">Q4 - Fourth Quarter</option>
                  <option value="Strategic">Strategic Initiative</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Innovation">Innovation Lab</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Create Project
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '12px 24px', background: '#e5e7eb', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      <section>
        <h3 style={{ color: 'var(--navy)', marginBottom: 16 }}>📋 Active Projects</h3>
        {projects.length === 0 ? (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
            <p>No projects available yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {projects.map(p => (
              <div key={p.id} className="card" style={{ padding: '16px', borderLeft: '4px solid var(--gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                  <div onClick={() => navigate(`/projects/${p.id}`)} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--navy)')}>
                    {p.name}
                  </div>
                    <p style={{ margin: '8px 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{p.description}</p>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>
                      <span>📅 Plan: <strong>{p.plan}</strong></span>
                      {p.createdBy && <span>👤 By {p.createdBy}</span>}
                      {p.createdAt && <span>📆 {p.createdAt}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ padding: '4px 12px', background: '#d1fae5', color: '#065f46', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>✓ Active</span>
                    {role === 'Administrator' && (
                      <button onClick={() => handleDeleteProject(p.id, p.name)} title="Delete project" style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
