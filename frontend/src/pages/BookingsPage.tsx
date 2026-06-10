import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { getBookings, createBooking } from '../api/bookings.api'
import { formatDate, formatCurrency } from '../utils/formatters'
import { type Booking, type PaginatedResponse } from '../types'
import { ExportMenu } from '../components/ExportMenu'
import { exportToCSV, exportTableToPDF, printContent, formatBookingForExport } from '../utils/exportUtils'

const bookingSchema = z.object({
  clientName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  eventType: z.string().min(2),
  eventDate: z.string().min(1),
  eventTimeStart: z.string().optional(),
  eventTimeEnd: z.string().optional(),
  venueArea: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  totalAmount: z.coerce.number().nonnegative(),
  notes: z.string().optional()
})

type BookingForm = z.infer<typeof bookingSchema>

const statusColors: Record<string, string> = {
  tentative: 'bg-amber-500/10 text-amber-300 border-amber-400/20',
  confirmed: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20',
  completed: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  cancelled: 'bg-red-500/10 text-red-300 border-red-400/20'
}

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-red-500/10 text-red-300',
  partial: 'bg-amber-500/10 text-amber-300',
  paid: 'bg-emerald-500/10 text-emerald-300'
}

export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState } = useForm<BookingForm>({ resolver: zodResolver(bookingSchema) })

  const bookingsQuery = useQuery<PaginatedResponse<Booking>>({
    queryKey: ['bookings', search],
    queryFn: () => getBookings({ search, page: 1, limit: 20 }),
    refetchInterval: 30000
  })

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      reset()
      setShowForm(false)
    }
  })

  const onSubmit = async (values: BookingForm) => {
    await createMutation.mutateAsync(values)
  }

  const bookings = bookingsQuery.data?.items ?? []
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      tentative: bookings.filter(b => b.bookingStatus === 'tentative').length,
      confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
      completed: bookings.filter(b => b.bookingStatus === 'completed').length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      paidAmount: bookings.reduce((sum, b) => sum + (b.advancePaid || 0), 0)
    }
  }, [bookings])

  const handleExportCSV = () => {
    const data = bookings.map(formatBookingForExport)
    exportToCSV(data, `bookings-${new Date().getTime()}`)
  }

  const handleExportPDF = () => {
    const columns = [
      { key: 'Booking Ref', label: 'Booking Ref' },
      { key: 'Client Name', label: 'Client' },
      { key: 'Event Type', label: 'Type' },
      { key: 'Total Amount', label: 'Amount' },
      { key: 'Booking Status', label: 'Status' },
      { key: 'Payment Status', label: 'Payment' }
    ]
    const data = bookings.map(formatBookingForExport)
    exportTableToPDF(data, columns, `bookings-${new Date().getTime()}`, 'Bookings Report')
  }

  const handlePrint = () => {
    printContent('bookings-table', 'Bookings Report')
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_18%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.12),_transparent_20%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-emerald-500/10 p-2">
                  <BookOpen className="text-emerald-300" size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Revenue Management</p>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Bookings</h1>
              <p className="mt-2 text-sm text-slate-300/90">Manage all event bookings and track payment status.</p>
              <p className="mt-3 text-xs text-cyan-300/70 font-semibold">● Live — {stats.total} bookings</p>
            </div>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bookings"
                className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />
              <ExportMenu
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                isLoading={bookingsQuery.isLoading}
              />
              <button
                onClick={() => setShowForm((value) => !value)}
                className="relative rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 px-6 py-3 font-semibold text-emerald-300 shadow-[0_8px_24px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/40 hover:shadow-[0_12px_32px_rgba(16,185,129,0.25)]"
              >
                {showForm ? 'Close' : 'New Booking'}
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/70">Total Bookings</p>
            <p className="mt-4 text-4xl font-semibold text-cyan-300">{stats.total}</p>
            <p className="mt-2 text-xs text-slate-400">All time bookings</p>
          </div>
          <div className="rounded-3xl border border-emerald-400/20 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/70">Confirmed</p>
            <p className="mt-4 text-4xl font-semibold text-emerald-300">{stats.confirmed}</p>
            <p className="mt-2 text-xs text-slate-400">Ready to execute</p>
          </div>
          <div className="rounded-3xl border border-amber-400/20 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/70">Revenue</p>
            <p className="mt-4 text-4xl font-semibold text-amber-300">{formatCurrency(stats.totalRevenue)}</p>
            <p className="mt-2 text-xs text-slate-400">Total value</p>
          </div>
        </div>

        {showForm && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <h3 className="text-xl font-semibold text-white">Create New Booking</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <input placeholder="Client name *" {...register('clientName')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input placeholder="Phone *" {...register('phone')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input placeholder="Email" {...register('email')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input placeholder="Event type" {...register('eventType')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input type="date" {...register('eventDate')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input type="time" placeholder="Start time" {...register('eventTimeStart')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input type="time" placeholder="End time" {...register('eventTimeEnd')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input placeholder="Venue area" {...register('venueArea')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input type="number" placeholder="Guest count" {...register('guestCount')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <input type="number" step="0.01" placeholder="Total amount *" {...register('totalAmount')} className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
              <textarea placeholder="Notes" {...register('notes')} className="col-span-full lg:col-span-3 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" rows={3} />
              <button type="submit" disabled={formState.isSubmitting} className="col-span-full lg:col-span-3 rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/30 to-emerald-500/20 px-6 py-3 font-semibold text-emerald-300 shadow-[0_8px_24px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/40 hover:shadow-[0_12px_32px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed">
                {formState.isSubmitting ? 'Creating...' : 'Create Booking'}
              </button>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">Bookings Pipeline</h3>
            <div className="flex items-center gap-2">
              {bookingsQuery.isRefetching && <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
              <span className="text-xs text-slate-400">{stats.total} total</span>
            </div>
          </div>

          {/* Printable Table */}
          <div id="bookings-table" className="hidden">
            <h2 className="text-2xl font-bold mb-4">Bookings Report</h2>
            <p className="text-sm text-slate-600 mb-6">Generated on {new Date().toLocaleDateString()}</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-400">
                  <th className="text-left p-2 font-bold">Booking Ref</th>
                  <th className="text-left p-2 font-bold">Client</th>
                  <th className="text-left p-2 font-bold">Event Date</th>
                  <th className="text-left p-2 font-bold">Amount</th>
                  <th className="text-left p-2 font-bold">Status</th>
                  <th className="text-left p-2 font-bold">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-200">
                    <td className="p-2 font-semibold">{booking.bookingRef}</td>
                    <td className="p-2">{booking.clientName}</td>
                    <td className="p-2">{booking.eventDate ? formatDate(booking.eventDate) : 'TBD'}</td>
                    <td className="p-2">{formatCurrency(booking.totalAmount)}</td>
                    <td className="p-2">{booking.bookingStatus}</td>
                    <td className="p-2">{booking.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Display Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Ref No</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Client</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Event Date</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Amount</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="cursor-pointer border-b border-slate-800/50 transition-all hover:border-slate-700 hover:bg-slate-900/80"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    <td className="px-4 py-4">
                      <span className="font-semibold text-white">{booking.bookingRef}</span>
                    </td>
                    <td className="px-4 py-4 text-white">{booking.clientName}</td>
                    <td className="px-4 py-4 text-slate-300">{booking.eventDate ? formatDate(booking.eventDate) : 'TBD'}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-300">{formatCurrency(booking.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[booking.bookingStatus] || statusColors.tentative}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusColors[booking.paymentStatus] || paymentStatusColors.unpaid}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">No bookings found. Create your first booking to get started.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
