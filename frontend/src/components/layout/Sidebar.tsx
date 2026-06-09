import { NavLink } from 'react-router-dom'
import { Home, ClipboardList, CalendarDays, Users, Settings2, ChartBar, CheckCircle2 } from 'lucide-react'
import { useRole } from '../../hooks/useRole'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/leads', label: 'Leads', icon: ClipboardList },
  { to: '/followups', label: 'Follow-Ups', icon: CheckCircle2 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: ChartBar, admin: true },
  { to: '/settings', label: 'Settings', icon: Settings2, admin: true }
]

export function Sidebar() {
  const { hasRole } = useRole()
  return (
    <aside className="w-72 shrink-0 bg-navy text-white p-6 flex flex-col gap-8 min-h-screen">
      <div>
        <div className="text-2xl font-[Cormorant_Garamond] text-gold">Le Aura Grand</div>
        <p className="mt-2 text-sm text-goldLight">Venue CRM</p>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          if (link.admin && !hasRole('admin')) return null
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive ? 'bg-gold text-navy' : 'text-slate-200 hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="text-xs text-slate-400">Designed for luxury event management</div>
    </aside>
  )
}
