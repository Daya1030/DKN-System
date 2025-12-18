import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home(){
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      <section className="hero">
        <div>
          <h1 className="headline">DKN — Knowledge & Governance that scales</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Organize documents, projects and communities with trusted governance and role-based access.</p>
        </div>
        <div>
          <button onClick={handleGetStarted} className="btn-cta">Get started</button>
        </div>
      </section>

      <section className="section">
        <h3><span className="gold-icon">★</span> Why DKN</h3>
        <p>DKN gives your organization a shared place for knowledge, supported by governance workflows and role privileges.</p>
      </section>

      <section className="section-alt">
        <h3><span className="gold-icon">📄</span> Core features</h3>
        <ul>
          <li>Projects & Documents</li>
          <li>Communities & Experts</li>
          <li>Role-based dashboards & governance</li>
        </ul>
      </section>
    </>
  )
}
