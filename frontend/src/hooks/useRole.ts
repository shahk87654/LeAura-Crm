import { useAuthStore } from '../store/authStore'

export function useRole() {
  const user = useAuthStore((state) => state.user)
  const hasRole = (role: 'admin' | 'manager') => user?.role === role
  return { user, hasRole }
}
