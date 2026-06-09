import { type PropsWithChildren, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function AuthGuard({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  useEffect(() => {
    document.title = 'Le Aura Grand CRM'
  }, [])

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
