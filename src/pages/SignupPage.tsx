import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function SignupPage(){
  const [name, setName] = useState('')
  const { login } = useAuth()
  const { push } = useToast()

  function handleSignup(e: React.FormEvent){
    e.preventDefault()
    if (!name.trim()) return push('Please enter a name')
    // in real app: call API to create user
    login(name.trim(), `${name.trim().toLowerCase()}@dkn.com`, 'USA', 'NewHire')
    push('Account created (demo)')
  }

  return (
    <section style={{ maxWidth: 520 }}>
      <h3>Create an account</h3>
      <div className="card">
        <form onSubmit={handleSignup} style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
          <label>Display name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit">Create account</button>
          </div>
        </form>
      </div>
    </section>
  )
}
