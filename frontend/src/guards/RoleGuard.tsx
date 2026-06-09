import { type PropsWithChildren } from 'react'
import { useRole } from '../hooks/useRole'
import { Navigate } from 'react-router-dom'

interface RoleGuardProps {
  role: 'admin' | 'manager'
}

export function RoleGuard({ role, children }: PropsWithChildren<RoleGuardProps>) {
  const { hasRole } = useRole()
  if (!hasRole(role)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
