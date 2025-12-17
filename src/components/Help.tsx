import { useState } from 'react'

export default function Help(){
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(s => !s)} title="Help">?</button>
      {open && (
        <div role="dialog" aria-label="Quick help" className="card" style={{ position: 'absolute', right: 16, top: 56, width: 320 }}>
          <h4>Quick start (for new users)</h4>
          <ol>
            <li>Sign in using the form next to this help button (enter your name and press Sign in).</li>
            <li>Use the navigation to browse Projects and Documents.</li>
            <li>Change your role to see role-based pages (Governance, Admin).</li>
            <li>Open a document to see versions and recommendations.</li>
          </ol>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
