import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const ROLE_HIERARCHY: Record<string, number> = {
	'NewHire': 1,
	'Consultant': 2,
	'KnowledgeChampion': 3,
	'Administrator': 4
}

export default function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }){
	const { role } = useAuth()
	const userLevel = ROLE_HIERARCHY[role] || 0
	const allowedLevels = roles.map(r => ROLE_HIERARCHY[r] || 0)
	const hasAccess = allowedLevels.some(level => userLevel >= level)
	
	if (hasAccess) return <>{children}</>
	return <div style={{ padding: 12 }} className="card">Access denied — requires role: {roles.join(', ')}</div>
}
