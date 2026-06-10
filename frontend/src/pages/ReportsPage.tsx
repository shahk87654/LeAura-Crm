import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar, Pie, ResponsiveContainer, BarChart, Bar as BarItem, XAxis, YAxis, Tooltip, Cell, PieChart, Pie as PieItem, Legend } from 'recharts'
import { AppShell } from '../components/layout/AppShell'
import { getSummaryReport, getRevenueReport, getLeadReport, getManagerReport, getVenueReport } from '../api/reports.api'
import { TrendingUp, Users, DollarSign } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { ExportMenu } from '../components/ExportMenu'
import { exportToCSV, exportHTMLToPDF, printContent } from '../utils/exportUtils'

interface SummaryReport {
  revenue: number
  confirmedBookings: number
  conversionRate: number
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-950 p-6 shadow-lg border border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color ?? 'bg-white/5'}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [range, setRange] = useState<{ startDate?: string; endDate?: string }>({})
  const summary = useQuery<SummaryReport>({ queryKey: ['report-summary', range], queryFn: () => getSummaryReport(range) })
  const revenue = useQuery<any[]>({ queryKey: ['report-revenue', range], queryFn: () => getRevenueReport(range) })
  const leads = useQuery<{ bySource: Array<{ _id: string; count: number }> }>({ queryKey: ['report-leads', range], queryFn: () => getLeadReport(range) })
  const manager = useQuery<any[]>({ queryKey: ['report-manager', range], queryFn: () => getManagerReport(range) })
  const venue = useQuery<any[]>({ queryKey: ['report-venue', range], queryFn: () => getVenueReport(range) })

  const handleExportCSV = () => {
    const reportData = [
      {
        'Report Type': 'Summary',
        'Total Revenue': summary.data?.revenue || 0,
        'Confirmed Bookings': summary.data?.confirmedBookings || 0,
        'Conversion Rate': `${summary.data?.conversionRate || 0}%`,
        'Date Generated': new Date().toISOString().split('T')[0]
      }
    ]
    exportToCSV(reportData, `report-${new Date().getTime()}`)
  }

  const handleExportPDF = () => {
    exportHTMLToPDF('reports-printable', `reports-${new Date().getTime()}`)
  }

  const handlePrint = () => {
    printContent('reports-printable', 'Business Reports')

  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-cyan-700 to-fuchsia-700 px-6 py-6 text-white shadow-xl border border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold">Reports</h2>
              <p className="text-slate-200/80 mt-1">Revenue, lead sources, and performance insights — beautifully presented.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                aria-label="Start date"
                placeholder="Start date"
                type="date"
                value={range.startDate ?? ''}
                onChange={(e) => setRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-white placeholder-white/50"
              />
              <input
                aria-label="End date"
                placeholder="End date"
                type="date"
                value={range.endDate ?? ''}
                onChange={(e) => setRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2 text-white placeholder-white/50"
              />
              <ExportMenu
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
              />
            </div>
          </div>
        </div>

        {/* Printable Reports */}
        <div id="reports-printable" className="hidden">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Business Reports</h1>
            <p className="text-slate-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border border-slate-300 rounded">
                <p className="text-xs text-slate-600 uppercase font-semibold">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(summary.data?.revenue ?? 0)}</p>
              </div>
              <div className="p-4 border border-slate-300 rounded">
                <p className="text-xs text-slate-600 uppercase font-semibold">Confirmed Bookings</p>
                <p className="text-xl font-bold">{summary.data?.confirmedBookings ?? 0}</p>
              </div>
              <div className="p-4 border border-slate-300 rounded">
                <p className="text-xs text-slate-600 uppercase font-semibold">Conversion Rate</p>
                <p className="text-xl font-bold">{summary.data?.conversionRate ?? 0}%</p>
              </div>
            </div>
          </div>

          {manager.data && manager.data.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Manager Performance</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-400">
                    <th className="text-left p-2 font-bold">Manager</th>
                    <th className="text-left p-2 font-bold">Leads Assigned</th>
                    <th className="text-left p-2 font-bold">Conversions</th>
                    <th className="text-left p-2 font-bold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {manager.data.map((item) => (
                    <tr key={item.manager} className="border-b border-slate-200">
                      <td className="p-2">{item.manager}</td>
                      <td className="p-2">{item.leadsAssigned}</td>
                      <td className="p-2">{item.conversions}</td>
                      <td className="p-2">{item.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <StatCard label="Total Revenue" value={formatCurrency(summary.data?.revenue ?? 0)} icon={<DollarSign />} color="bg-amber-500/10" />
          <StatCard label="Confirmed Bookings" value={summary.data?.confirmedBookings ?? 0} icon={<Users />} color="bg-cyan-500/10" />
          <StatCard label="Conversion Rate" value={`${summary.data?.conversionRate ?? 0}%`} icon={<TrendingUp />} color="bg-emerald-500/10" />
        </div>

        <section className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Monthly Revenue</h3>
            <p className="text-sm text-slate-400">Last 12 months</p>
          </div>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.data ?? []} margin={{ left: 0, right: 0 }}>
                <XAxis dataKey="_id" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip wrapperStyle={{ color: '#000' }} />
                <BarItem dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800">
            <h3 className="text-xl font-semibold text-white">Leads by Source</h3>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <PieItem data={leads.data?.bySource ?? []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}>
                    {(leads.data?.bySource ?? []).map((entry, index) => (
                      <Cell key={entry._id} fill={['#06b6d4', '#0f172a', '#64748B', '#F59E0B'][index % 4]} />
                    ))}
                  </PieItem>
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800">
            <h3 className="text-xl font-semibold text-white">Venue Utilization</h3>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <PieItem data={venue.data ?? []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}>
                    {(venue.data ?? []).map((entry, index) => (
                      <Cell key={entry._id} fill={['#C9A96E', '#0f172a', '#F59E0B', '#9333EA'][index % 4]} />
                    ))}
                  </PieItem>
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Manager Performance</h3>
            <p className="text-sm text-slate-400">Sorted by revenue</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Leads Assigned</th>
                  <th className="px-4 py-3">Conversions</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {manager.data?.map((item) => (
                  <tr key={item.manager} className="border-b border-slate-800 hover:bg-slate-900">
                    <td className="px-4 py-4 text-white">{item.manager}</td>
                    <td className="px-4 py-4 text-slate-300">{item.leadsAssigned}</td>
                    <td className="px-4 py-4 text-slate-300">{item.conversions}</td>
                    <td className="px-4 py-4 text-white">{item.revenue}</td>
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
