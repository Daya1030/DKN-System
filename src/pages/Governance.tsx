import React, { useEffect, useState } from 'react'
import { fetchGovernanceLogs } from '../api'

export default function Governance(){
  const [logs, setLogs] = useState<any[]>([])
  useEffect(()=>{ fetchGovernanceLogs().then(setLogs) }, [])
  return (
    <section>
      <h3>Governance / Audit</h3>
      <ul>
        {logs.map(l => <li key={l.id}>{l.time} — {l.actor} — {l.action} — {l.target}</li>)}
      </ul>
    </section>
  )
}
