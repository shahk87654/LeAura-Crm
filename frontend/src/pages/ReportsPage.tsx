import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar, Pie, ResponsiveContainer, BarChart, Bar as BarItem, XAxis, YAxis, Tooltip, Cell, PieChart, Pie as PieItem, Legend } from 'recharts'
import { AppShell } from '../components/layout/AppShell'
import { getSummaryReport, getRevenueReport, getLeadReport, getManagerReport, getVenueReport } from '../api/reports.api'

interface SummaryReport {
  revenue: number
  confirmedBookings: number
  conversionRate: number
}

export default function ReportsPage() {
  const [range, setRange] = useState<{ startDate?: string; endDate?: string }>({})
  const summary = useQuery<SummaryReport>({ queryKey: ['report-summary', range], queryFn: () => getSummaryReport(range) })
  const revenue = useQuery<any[]>({ queryKey: ['report-revenue', range], queryFn: () => getRevenueReport(range) })
  const leads = useQuery<{ bySource: Array<{ _id: string; count: number }> }>({ queryKey: ['report-leads', range], queryFn: () => getLeadReport(range) })
  const manager = useQuery<any[]>({ queryKey: ['report-manager', range], queryFn: () => getManagerReport(range) })
  const venue = useQuery<any[]>({ queryKey: ['report-venue', range], queryFn: () => getVenueReport(range) })

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-navy">Reports</h2>
              <p className="text-slate-500">Revenue, lead sources, and manager performance.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                placeholder="Start date"
                type="date"
                value={range.startDate ?? ''}
                onChange={(e) => setRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <input
                placeholder="End date"
                type="date"
                value={range.endDate ?? ''}
                onChange={(e) => setRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total Revenue</p>
            <p className="mt-4 text-3xl font-semibold text-navy">{summary.data?.revenue ?? 0}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total Bookings</p>
            <p className="mt-4 text-3xl font-semibold text-navy">{summary.data?.confirmedBookings ?? 0}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Conversion Rate</p>
            <p className="mt-4 text-3xl font-semibold text-navy">{summary.data?.conversionRate ?? 0}%</p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-navy">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.data ?? []}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <BarItem dataKey="revenue" fill="#C9A96E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-navy">Leads by Source</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <PieItem data={leads.data?.bySource ?? []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90}>
                    {(leads.data?.bySource ?? []).map((entry, index) => (
                      <Cell key={entry._id} fill={['#C9A96E', '#1A1A2E', '#64748B', '#F59E0B'][index % 4]} />
                    ))}
                  </PieItem>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-navy">Venue Utilization</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <PieItem data={venue.data ?? []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90}>
                    {(venue.data ?? []).map((entry, index) => (
                      <Cell key={entry._id} fill={['#C9A96E', '#0f172a', '#F59E0B', '#9333EA'][index % 4]} />
                    ))}
                  </PieItem>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-navy">Manager Performance</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Leads Assigned</th>
                  <th className="px-4 py-3">Conversions</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {manager.data?.map((item) => (
                  <tr key={item.manager} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-700">{item.manager}</td>
                    <td className="px-4 py-4 text-slate-700">{item.leadsAssigned}</td>
                    <td className="px-4 py-4 text-slate-700">{item.conversions}</td>
                    <td className="px-4 py-4 text-slate-700">{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
