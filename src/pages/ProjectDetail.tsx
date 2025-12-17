import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProjectById } from '../api'
import RecommendationPanel from '../components/RecommendationPanel'

export default function ProjectDetail(){
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    fetchProjectById(id).then(setProject)
  }, [id])

  if (!project) return <div>Loading...</div>

  return (
    <section>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div>
        <strong>Linked documents</strong>
        <ul>
          {project.documents.map((d:any)=> (
            <li key={d.id}><Link to={`/documents/${d.id}`}>{d.title}</Link> (v{d.version})</li>
          ))}
        </ul>
      </div>
      <RecommendationPanel context={{ project }} />
    </section>
  )
}
