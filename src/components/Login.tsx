import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const COUNTRIES = ['North America', 'Europe', 'Asia']

export default function Login(){
  const { user, login, logout } = useAuth()
  const { push } = useToast()
  const [name, setName] = useState('')
  const [country, setCountry] = useState('USA')

  if (user) return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
      <div>{user.name} ({user.country})</div>
      <button onClick={() => { logout(); push('Signed out') }}>Sign out</button>
    </div>
  )

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); if(name && country){ login(name, `${name.toLowerCase()}@dkn.com`, country, 'NewHire'); push(`Signed in as ${name} from ${country}`); setName('') } }} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <input aria-label="Your name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
      <select value={country} onChange={e=>setCountry(e.target.value)}>
        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button type="submit">Sign in</button>
    </form>
  )
}
