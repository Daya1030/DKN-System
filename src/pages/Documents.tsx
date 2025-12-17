import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDocuments } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface UploadedDoc {
  id: string
  title: string
  description: string
  fileName: string
  uploadedBy: string
  uploadedByRole: string
  uploadedAt: string
  tags: string[]
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  rejectionReason?: string
}

export default function Documents(){
  const [docs, setDocs] = useState<any[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', fileName: '', tags: '' })
  const { user, role } = useAuth()
  const { push } = useToast()

  const canApprove = role === 'KnowledgeChampion' || role === 'Administrator'
  const pendingDocs = uploadedDocs.filter(d => d.status === 'pending' && d.uploadedByRole !== role)
  const approvedDocs = uploadedDocs.filter(d => d.status === 'approved')

  useEffect(() => {
    fetchDocuments().then(setDocs)
    // Load uploaded docs from localStorage
    try {
      const saved = localStorage.getItem('dkn:uploaded-docs')
      if (saved) setUploadedDocs(JSON.parse(saved))
    } catch {}
  }, [])

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.fileName) {
      push('Please fill in title and select a file')
      return
    }

    const newDoc: UploadedDoc = {
      id: `upload-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      fileName: formData.fileName,
      uploadedBy: user?.name || 'Unknown',
      uploadedByRole: role,
      uploadedAt: new Date().toLocaleDateString(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      status: role === 'Consultant' ? 'pending' : 'approved'
    }

    const updated = [newDoc, ...uploadedDocs]
    setUploadedDocs(updated)
    localStorage.setItem('dkn:uploaded-docs', JSON.stringify(updated))
    push(role === 'Consultant' ? `Document "${formData.title}" submitted for approval!` : `Document "${formData.title}" uploaded successfully!`)
    setFormData({ title: '', description: '', fileName: '', tags: '' })
    setShowUpload(false)
  }

  const handleApproveDocument = (docId: string, docTitle: string) => {
    const updated = uploadedDocs.map(d => 
      d.id === docId 
        ? { ...d, status: 'approved' as const, approvedBy: user?.name }
        : d
    )
    setUploadedDocs(updated)
    localStorage.setItem('dkn:uploaded-docs', JSON.stringify(updated))
    push(`Document "${docTitle}" approved!`)
  }

  const handleRejectDocument = (docId: string, docTitle: string) => {
    const reason = prompt('Reason for rejection:')
    if (reason === null) return
    
    const updated = uploadedDocs.map(d =>
      d.id === docId
        ? { ...d, status: 'rejected' as const, rejectionReason: reason }
        : d
    )
    setUploadedDocs(updated)
    localStorage.setItem('dkn:uploaded-docs', JSON.stringify(updated))
    push(`Document "${docTitle}" rejected`)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Store file data in localStorage
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          content: event.target?.result,
          uploadedAt: new Date().toISOString()
        }
        localStorage.setItem(`file-${file.name}`, JSON.stringify(fileData))
      }
      reader.readAsDataURL(file)
      setFormData({ ...formData, fileName: file.name })
    }
  }

  const handleDownloadFile = (fileName: string) => {
    try {
      const fileData = localStorage.getItem(`file-${fileName}`)
      if (fileData) {
        const parsed = JSON.parse(fileData)
        const link = document.createElement('a')
        link.href = parsed.content
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        push(`Downloading ${fileName}...`)
      } else {
        push('File not found. Please re-upload.')
      }
    } catch (error) {
      push('Error downloading file')
    }
  }

  const handleViewFile = (doc: UploadedDoc) => {
    try {
      const fileData = localStorage.getItem(`file-${doc.fileName}`)
      if (fileData) {
        const parsed = JSON.parse(fileData)
        // Open in new tab
        const link = document.createElement('a')
        link.href = parsed.content
        link.target = '_blank'
        link.click()
        push(`Opening ${doc.fileName}...`)
      } else {
        push('File content not available')
      }
    } catch (error) {
      push('Error opening file')
    }
  }

  return (
    <>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, color: 'var(--navy)' }}>Documents</h3>
          <button onClick={() => setShowUpload(!showUpload)} style={{ padding: '10px 20px', background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
            {showUpload ? '✕ Close' : '+ Upload Document'}
          </button>
        </div>

        {showUpload && (
          <div className="card" style={{ background: '#f9fafb', padding: '24px', marginBottom: '24px', border: '2px solid var(--gold)' }}>
            <h4 style={{ marginTop: 0, color: 'var(--navy)' }}>Upload New Document</h4>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Best Practices for Mobile Development"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Description</label>
                <textarea
                  placeholder="Add a brief description of the document..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Select File *</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  style={{ padding: '8px', border: '1px solid #e0e7ff', borderRadius: '8px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
                />
                {formData.fileName && <div style={{ marginTop: 8, padding: '8px', background: '#e8f5e9', borderRadius: '6px', color: '#2e7d32', fontSize: '0.9rem' }}>✓ {formData.fileName}</div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--navy)' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., development, best-practices, mobile"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e0e7ff', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Upload Document
                </button>
                <button type="button" onClick={() => setShowUpload(false)} style={{ padding: '12px 24px', background: '#e5e7eb', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {uploadedDocs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ color: 'var(--navy)', marginBottom: 16 }}>📤 My Uploaded Documents</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {uploadedDocs.map(doc => (
              <div key={doc.id} className="card" style={{ padding: '16px', borderLeft: `4px solid ${doc.status === 'approved' ? '#34d399' : doc.status === 'rejected' ? '#ef4444' : '#f6c85f'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>{doc.title}</div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: doc.status === 'approved' ? '#d1fae5' : doc.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: doc.status === 'approved' ? '#065f46' : doc.status === 'rejected' ? '#7f1d1d' : '#92400e' }}>
                      {doc.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{doc.description}</p>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>
                    <span>📄 {doc.fileName}</span>
                    <span>👤 {doc.uploadedBy}</span>
                    <span>📅 {doc.uploadedAt}</span>
                    {doc.approvedBy && <span>✓ Approved by {doc.approvedBy}</span>}
                  </div>
                  {doc.rejectionReason && <div style={{ marginTop: 8, padding: '8px', background: '#fee2e2', borderRadius: '4px', color: '#7f1d1d', fontSize: '0.85rem' }}>❌ Reason: {doc.rejectionReason}</div>}
                  {doc.tags.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {doc.tags.map((tag, idx) => (
                        <span key={idx} style={{ padding: '4px 10px', background: '#e8f4f8', color: '#0369a1', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-start' }}>
                  <button onClick={() => handleViewFile(doc)} title="Open file" style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                    👁️ View
                  </button>
                  <button onClick={() => handleDownloadFile(doc.fileName)} title="Download file" style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {canApprove && pendingDocs.length > 0 && (
        <section style={{ marginBottom: 32, background: '#fef3c7', padding: '20px', borderRadius: '12px', border: '2px solid var(--gold)' }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--navy)' }}>⏳ Pending Approvals ({pendingDocs.length})</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {pendingDocs.map(doc => (
              <div key={doc.id} className="card" style={{ padding: '16px', background: 'white', borderLeft: '4px solid #f6c85f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: 4 }}>{doc.title}</div>
                    <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{doc.description}</p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>
                      <span>👤 {doc.uploadedBy} ({doc.uploadedByRole})</span>
                      <span>📅 {doc.uploadedAt}</span>
                    </div>
                    {doc.tags.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {doc.tags.map((tag, idx) => (
                          <span key={idx} style={{ padding: '4px 10px', background: '#e8f4f8', color: '#0369a1', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleViewFile(doc)} title="Open file" style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                      👁️ View
                    </button>
                    <button onClick={() => handleApproveDocument(doc.id, doc.title)} style={{ padding: '8px 16px', background: '#34d399', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleRejectDocument(doc.id, doc.title)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 style={{ color: 'var(--navy)' }}>📚 Shared Documents Library</h3>
        {approvedDocs.length === 0 ? (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
            <p>No approved documents available yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {approvedDocs.map(d => (
              <div key={d.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <Link to={`/documents/${d.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <div style={{ cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>
                      {d.title}
                    </div>
                    <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{d.description}</p>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>📤 By {d.uploadedBy} • 📅 {d.uploadedAt} • 🏷️ {d.tags.join(', ')}</div>
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleViewFile(d)} title="Open file" style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                    👁️ View
                  </button>
                  <button onClick={() => handleDownloadFile(d.fileName)} title="Download file" style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
