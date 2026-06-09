import { LogOut, Bell } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function TopBar() {
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return (
    <div className="flex items-center justify-between gap-4 bg-white/80 px-6 py-4 shadow-sm sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-semibold text-navy">Le Aura Grand CRM</h1>
        <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-full bg-slate-100 p-2 text-navy">
          <Bell size={18} />
        </button>
        <button
          onClick={() => {
            clearAuth()
            window.location.href = '/login'
          }}
          className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-navy font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}
