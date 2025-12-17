import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchDocumentById } from '../api'
import RecommendationPanel from '../components/RecommendationPanel'
import { useToast } from '../contexts/ToastContext'

export default function DocumentDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fileContent, setFileContent] = useState<string>('')

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
        push('File not found. Please check if it was properly uploaded.')
      }
    } catch (error) {
      push('Error downloading file')
    }
  }

  const handleViewFile = (fileName: string) => {
    try {
      const fileData = localStorage.getItem(`file-${fileName}`)
      if (fileData) {
        const parsed = JSON.parse(fileData)
        // Open in new tab
        const link = document.createElement('a')
        link.href = parsed.content
        link.target = '_blank'
        link.click()
        push(`Opening ${fileName}...`)
      } else {
        push('File content not available')
      }
    } catch (error) {
      push('Error opening file')
    }
  }

  useEffect(() => {
    if (!id) return

    // First check if it's an uploaded document in localStorage
    try {
      const saved = localStorage.getItem('dkn:uploaded-docs')
      if (saved) {
        const uploadedDocs = JSON.parse(saved)
        const found = uploadedDocs.find((d: any) => d.id === id)
        if (found) {
          setDoc({
            id: found.id,
            title: found.title,
            version: '1.0',
            status: found.status,
            tags: found.tags,
            description: found.description,
            fileName: found.fileName,
            uploadedBy: found.uploadedBy,
            uploadedAt: found.uploadedAt,
            versions: [{ version: '1.0', notes: 'Original upload' }],
            content: `Document: ${found.fileName}\nUploaded by: ${found.uploadedBy}\nDate: ${found.uploadedAt}\n\n${found.description}`
          })
          setLoading(false)
          return
        }
      }
    } catch {}

    // If not found in localStorage, fetch from API
    fetchDocumentById(id).then(doc => {
      setDoc(doc)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Loading document...</div>
  
  if (!doc) return (
    <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
      <p>Document not found</p>
      <button onClick={() => navigate('/documents')} style={{ marginTop: '12px', padding: '8px 16px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        ← Back to Documents
      </button>
    </div>
  )

  return (
    <>
      <section>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/documents')} style={{ padding: '8px 16px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, marginBottom: 16 }}>
            ← Back to Documents
          </button>
          <h2 style={{ margin: '0 0 8px', color: 'var(--navy)' }}>{doc.title}</h2>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.9rem', color: 'var(--muted)', alignItems: 'center' }}>
            <span>Version {doc.version}</span>
            <span>Status: <strong>{doc.status}</strong></span>
            {doc.uploadedBy && <span>By {doc.uploadedBy}</span>}
            {doc.uploadedAt && <span>{doc.uploadedAt}</span>}
            {doc.fileName && (
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button onClick={() => handleViewFile(doc.fileName)} title="Open file" style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  👁️ View
                </button>
                <button onClick={() => handleDownloadFile(doc.fileName)} title="Download file" style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  ⬇️ Download
                </button>
              </div>
            )}
          </div>
        </div>

        {doc.tags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {doc.tags.map((tag: string, idx: number) => (
              <span key={idx} style={{ display: 'inline-block', marginRight: 8, padding: '4px 10px', background: '#e8f4f8', color: '#0369a1', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {doc.description && (
        <section>
          <h3 style={{ color: 'var(--navy)' }}>Description</h3>
          <div className="card" style={{ padding: '16px', background: '#f9fafb' }}>
            <p>{doc.description}</p>
          </div>
        </section>
      )}

      {doc.fileName && (
        <section>
          <h3 style={{ color: 'var(--navy)' }}>📄 File Information</h3>
          <div className="card" style={{ padding: '16px', background: '#f0f9ff', border: '2px solid #0369a1' }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>📎 {doc.fileName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>Click the buttons above to view or download this file</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleViewFile(doc.fileName)} style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                    👁️ View File
                  </button>
                  <button onClick={() => handleDownloadFile(doc.fileName)} style={{ padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
                    ⬇️ Download File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <h3 style={{ color: 'var(--navy)' }}>Content</h3>
        <div className="card" style={{ padding: '20px', background: '#f9fafb', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--navy)' }}>
          {doc.content}
        </div>
      </section>

      <section>
        <h3 style={{ color: 'var(--navy)' }}>Version History</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {doc.versions && doc.versions.map((v: any) => (
            <div key={v.version} className="card" style={{ padding: '12px', background: v.version === doc.version ? '#e8f5e9' : '#f9fafb' }}>
              <div style={{ fontWeight: 600, color: 'var(--navy)' }}>Version {v.version} {v.version === doc.version && '(Current)'}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 4 }}>{v.notes}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <RecommendationPanel context={{ document: doc }} />
      </section>
    </>
  )
}
