import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchDocumentById } from '../api'
import RecommendationPanel from '../components/RecommendationPanel'

export default function DocumentDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
          <div style={{ display: 'flex', gap: 16, fontSize: '0.9rem', color: 'var(--muted)' }}>
            <span>Version {doc.version}</span>
            <span>Status: <strong>{doc.status}</strong></span>
            {doc.uploadedBy && <span>By {doc.uploadedBy}</span>}
            {doc.uploadedAt && <span>{doc.uploadedAt}</span>}
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
