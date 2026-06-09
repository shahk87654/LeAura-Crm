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
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total Leads</p>
          <p className="mt-4 text-3xl font-semibold text-navy">{totalLeads}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Confirmed Bookings</p>
          <p className="mt-4 text-3xl font-semibold text-navy">{totalBookings}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Revenue This Month</p>
          <p className="mt-4 text-3xl font-semibold text-navy">{formatCurrency(revenue)}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Conversion Rate</p>
          <p className="mt-4 text-3xl font-semibold text-navy">{conversionRate}%</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Latest Leads</h2>
          <div className="mt-4 space-y-3">
            {leadsQuery.data?.items.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-navy">{lead.fullName}</p>
                <p className="text-sm text-slate-500">{lead.eventType} • {lead.stage}</p>
              </div>
            ))}
            {!leadsQuery.data?.items.length && <p className="text-slate-500">No recent leads yet.</p>}
          </div>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Booking Status</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingStatusData} margin={{ top: 10, right: 0, left: -20, bottom: 10 }}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!bookingStatusData.length && <p className="mt-4 text-slate-500">No booking data available.</p>}
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Role Summary</h2>
          <div className="mt-4 text-slate-600">
            <p><span className="font-semibold">Role:</span> {user?.role}</p>
            <p className="mt-2"><span className="font-semibold">Name:</span> {user?.name}</p>
            <p className="mt-2"><span className="font-semibold">Email:</span> {user?.email}</p>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
