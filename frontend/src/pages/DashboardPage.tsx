import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppShell } from '../components/layout/AppShell'
import { getLeads } from '../api/leads.api'
import { getBookings } from '../api/bookings.api'
import { getSummaryReport } from '../api/reports.api'
import { useRole } from '../hooks/useRole'
import { formatCurrency } from '../utils/formatters'
import { type Lead, type Booking, type PaginatedResponse } from '../types'

interface DashboardReport {
  revenue: number
  conversionRate: number
  confirmedBookings: number
}

export default function DashboardPage() {
  const { user } = useRole()
  const leadsQuery = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['leads', { assignedTo: user?.id }],
    queryFn: () => getLeads({ page: 1, limit: 5, assignedTo: user?.id }),
    staleTime: 1000 * 60
  })
  const bookingsQuery = useQuery<PaginatedResponse<Booking>>({
    queryKey: ['bookings', { manager: user?.id }],
    queryFn: () => getBookings({ page: 1, limit: 5, manager: user?.id }),
    staleTime: 1000 * 60
  })
  const reportQuery = useQuery<DashboardReport>({
    queryKey: ['report', { startDate: '', endDate: '' }],
    queryFn: () => getSummaryReport({}),
    enabled: user?.role === 'admin'
  })

  const totalLeads = leadsQuery.data?.total ?? 0
  const totalBookings = bookingsQuery.data?.total ?? 0
  const revenue = reportQuery.data?.revenue ?? 0
  const conversionRate = reportQuery.data?.conversionRate ?? 0

  const bookingStatusData = useMemo(() => {
    const counts = bookingsQuery.data?.items.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.bookingStatus ?? 'pending'] = (acc[booking.bookingStatus ?? 'pending'] ?? 0) + 1
      return acc
    }, {}) ?? {}

    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  }, [bookingsQuery.data?.items])

  return (
    <AppShell>
      <div className="grid gap-6">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_20%)] opacity-90" />
          <div className="relative grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Systems Control</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white">Welcome back, {user?.name}</h1>
              <p className="max-w-2xl text-sm text-slate-300/90">
                Your mission control for leads, bookings, and revenue insights. Navigate the latest updates with clarity and speed.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_12px_40px_rgba(56,189,248,0.18)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Leads</p>
                <p className="mt-4 text-4xl font-semibold text-white">{totalLeads}</p>
              </div>
              <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-[0_12px_40px_rgba(168,85,247,0.18)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-300/70">Bookings</p>
                <p className="mt-4 text-4xl font-semibold text-white">{totalBookings}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total Leads</p>
            <p className="mt-4 text-3xl font-semibold text-cyan-300">{totalLeads}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Confirmed Bookings</p>
            <p className="mt-4 text-3xl font-semibold text-fuchsia-300">{totalBookings}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Revenue</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-300">{formatCurrency(revenue)}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Conversion Rate</p>
            <p className="mt-4 text-3xl font-semibold text-violet-300">{conversionRate}%</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Booking Status</h2>
                <p className="text-sm text-slate-400">Live breakdown of booking progress.</p>
              </div>
              <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">Realtime</span>
            </div>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStatusData} margin={{ top: 10, right: 0, left: -20, bottom: 10 }}>
                  <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip wrapperStyle={{ backgroundColor: '#111827', borderRadius: 12, border: '1px solid rgba(148,163,184,0.2)' }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {!bookingStatusData.length && <p className="mt-4 text-slate-400">No booking data available.</p>}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
                  <p className="text-sm text-slate-400">Latest inbound leads assigned to you.</p>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">New</span>
              </div>
              <div className="mt-5 space-y-4">
                {leadsQuery.data?.items.map((lead) => (
                  <div key={lead.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.22)]">
                    <p className="font-semibold text-white">{lead.fullName}</p>
                    <p className="text-sm text-slate-400">{lead.eventType} • {lead.stage}</p>
                  </div>
                ))}
                {!leadsQuery.data?.items.length && <p className="text-slate-400">No recent leads yet.</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
                  <p className="text-sm text-slate-400">A quick snapshot of the latest bookings.</p>
                </div>
                <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-fuchsia-300">Live</span>
              </div>
              <div className="mt-5 space-y-3">
                {bookingsQuery.data?.items.map((booking) => (
                  <div key={booking.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.22)]">
                    <p className="font-semibold text-white">{booking.clientName ?? 'Unnamed booking'}</p>
                    <p className="text-sm text-slate-400">{booking.bookingStatus ?? 'pending'} • {formatCurrency(booking.totalAmount ?? 0)}</p>
                  </div>
                ))}
                {!bookingsQuery.data?.items.length && <p className="text-slate-400">No recent bookings yet.</p>}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
              <h2 className="text-lg font-semibold text-white">Your Profile</h2>
              <div className="mt-4 space-y-3 text-slate-300">
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="mt-1 text-lg font-semibold text-white">{user?.name}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Role</p>
                  <p className="mt-1 text-lg font-semibold text-white">{user?.role}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="mt-1 text-lg font-semibold text-white">{user?.email}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
