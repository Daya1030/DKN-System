import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Help(){
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  
  return (
    <div>
      <button aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(s => !s)} title="AI Recommendations" style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>🤖 AI</button>
      {open && (
        <div role="dialog" aria-label="AI Recommendations" className="card" style={{ position: 'absolute', right: 16, top: 56, width: 360, background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', padding: '20px', zIndex: 1000 }}>
          <h4 style={{ margin: '0 0 16px', color: '#0b2340', fontSize: '1.1rem', fontWeight: 700 }}>🤖 AI Recommendations</h4>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.9rem', color: '#1e40af' }}>
            <strong>Smart Suggestions:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
              <li>Upload documents to get approval recommendations</li>
              <li>Join communities related to your expertise</li>
              <li>Review pending documents for approval</li>
              <li>Connect with Knowledge Champions for mentoring</li>
            </ul>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.9rem', color: '#166534' }}>
            <strong>✓ AI-Powered Features:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
              <li>Content classification & tagging</li>
              <li>Smart document routing</li>
              <li>Peer recommendations</li>
              <li>Knowledge gaps detection</li>
            </ul>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', background: '#e5e7eb', color: '#1f2937', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Close</button>
            <button onClick={() => { setOpen(false); navigate('/documents'); }} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Learn More</button>
          </div>
        </div>
      )}
    </div>
  )
}
