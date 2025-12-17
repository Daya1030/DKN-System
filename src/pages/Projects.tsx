import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../api'

export default function Projects(){
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetchProjects().then(setProjects)
  }, [])

  return (
    <section>
      <h3>Projects</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {projects.map(p => (
          <article key={p.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
            <strong><Link to={`/projects/${p.id}`}>{p.name}</Link></strong>
            <p style={{ margin: 6 }}>{p.description}</p>
            <small>Documents, templates, and experts linked.</small>
          </article>
        ))}
      </div>
    </section>
  )
}
