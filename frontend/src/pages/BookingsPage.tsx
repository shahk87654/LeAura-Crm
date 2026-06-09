import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '../components/layout/AppShell'
import { getBookings, createBooking } from '../api/bookings.api'
import { formatDate, formatCurrency } from '../utils/formatters'
import { type Booking, type PaginatedResponse } from '../types'

const bookingSchema = z.object({
  clientName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  eventType: z.string().min(2),
  eventDate: z.string().optional(),
  eventTimeStart: z.string().optional(),
  eventTimeEnd: z.string().optional(),
  venueArea: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  totalAmount: z.coerce.number().nonnegative(),
  notes: z.string().optional()
})

type BookingForm = z.infer<typeof bookingSchema>

export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState } = useForm<BookingForm>({ resolver: zodResolver(bookingSchema) })

  const bookingsQuery = useQuery<PaginatedResponse<Booking>>({
    queryKey: ['bookings', search],
    queryFn: () => getBookings({ search, page: 1, limit: 20 })
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

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy">Bookings</h2>
            <p className="text-slate-500">Review all bookings and payment status.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings"
              className="w-full max-w-sm rounded-2xl border border-slate-200 px-4 py-3"
            />
            <button
              onClick={() => setShowForm((value) => !value)}
              className="rounded-2xl bg-gold px-5 py-3 font-semibold text-navy"
            >
              {showForm ? 'Close Create' : 'New Booking'}
            </button>
          </div>
        </div>
        {showForm && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-navy">New Booking</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
              <input placeholder="Client name" {...register('clientName')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input placeholder="Phone" {...register('phone')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input placeholder="Email" {...register('email')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input placeholder="Event type" {...register('eventType')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="date" {...register('eventDate')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="time" {...register('eventTimeStart')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="time" {...register('eventTimeEnd')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input placeholder="Venue area" {...register('venueArea')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="number" placeholder="Guest count" {...register('guestCount')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="number" step="0.01" placeholder="Total amount" {...register('totalAmount')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <textarea placeholder="Notes" {...register('notes')} className="col-span-full rounded-2xl border border-slate-200 px-4 py-3" rows={4} />
              <button type="submit" disabled={formState.isSubmitting} className="col-span-full rounded-2xl bg-gold px-5 py-3 font-semibold text-navy">
                Save Booking
              </button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Ref No</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Event Date</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingsQuery.data?.items.map((booking) => (
                <tr
                  key={booking.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                >
                  <td className="px-4 py-4 text-slate-700">{booking.bookingRef}</td>
                  <td className="px-4 py-4 text-slate-700">{booking.clientName}</td>
                  <td className="px-4 py-4 text-slate-700">{booking.eventDate ? formatDate(booking.eventDate) : 'TBD'}</td>
                  <td className="px-4 py-4 text-slate-700">{booking.venueArea ?? 'TBD'}</td>
                  <td className="px-4 py-4 text-slate-700">{formatCurrency(booking.totalAmount)}</td>
                  <td className="px-4 py-4 text-slate-700">{booking.bookingStatus}</td>
                </tr>
              ))}
              {!bookingsQuery.data?.items.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No bookings available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
