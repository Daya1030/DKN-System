import React, { useEffect, useState } from 'react'
import { fetchAnalytics } from '../api'

export default function Analytics(){
  const [data, setData] = useState<any>(null)
  useEffect(()=>{ fetchAnalytics().then(setData) }, [])
  if (!data) return <div>Loading analytics...</div>
  return (
    <section>
      <h3>Analytics</h3>
      <div>Documents published: {data.documentsPublished}</div>
      <div>Active communities: {data.activeCommunities}</div>
      <div>Top skills: {data.topSkills.join(', ')}</div>
    </section>
  )
}
