import React, { useEffect, useState } from 'react'
import { fetchNotifications } from '../api'

export default function Notifications(){
  const [notes, setNotes] = useState<any[]>([])
  useEffect(()=>{ fetchNotifications().then(setNotes) }, [])
  return (
    <section>
      <h3>Notifications</h3>
      <ul>
        {notes.map(n => <li key={n.id}>{n.time} — {n.message}</li>)}
      </ul>
    </section>
  )
}
