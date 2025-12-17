import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
	const { user } = useAuth()
	
	if (!user) {
		return <Navigate to="/login" replace />
	}
	
	return <>{children}</>
}
