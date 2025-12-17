import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Login from './Login'
import Help from './Help'
import { useState } from 'react'

export default function Header(){
  const { role, setRole, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleMobile = () => setMobileOpen(!mobileOpen)
  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-circle" aria-hidden>DKN</div>
        <div className="brand-text">
          <h2>DKN</h2>
          <div className="brand-subtitle">Knowledge & Governance</div>
        </div>
      </div>

      <button className="mobile-menu-btn" onClick={toggleMobile} aria-label="Toggle menu" aria-expanded={mobileOpen}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`main-nav ${mobileOpen ? 'mobile-open' : ''}`}>
        <NavLink className={({isActive}) => isActive ? 'active' : ''} to="/" onClick={closeMobile}>Home</NavLink>
        <NavLink className={({isActive}) => isActive ? 'active' : ''} to="/dashboard" onClick={closeMobile}>Dashboard</NavLink>
        <NavLink className={({isActive}) => isActive ? 'active' : ''} to="/projects" onClick={closeMobile}>Projects</NavLink>
        <NavLink className={({isActive}) => isActive ? 'active' : ''} to="/documents" onClick={closeMobile}>Documents</NavLink>
        <NavLink className={({isActive}) => isActive ? 'active' : ''} to="/communities" onClick={closeMobile}>Communities</NavLink>
      </nav>
      <div className="header-actions">
        <Help />
        <Login />
        {user ? (
          <NavLink to="/dashboard" className="user-link" title="Dashboard">
            <div className="user-avatar">{user.name.slice(0,1).toUpperCase()}</div>
          </NavLink>
        ) : null}
        <div className="role-group">
          <label htmlFor="role-select">Role</label>
          <select className="role-select" id="role-select" aria-label="Select role" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="NewHire">New Hire</option>
            <option value="Consultant">Consultant</option>
            <option value="KnowledgeChampion">Knowledge Champion</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>
    </header>
  )
}
