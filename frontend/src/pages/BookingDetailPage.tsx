import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { getBooking, updateBooking } from '../api/bookings.api'
import { formatDate, formatCurrency } from '../utils/formatters'
import { type Booking, type Payment } from '../types'

type BookingDetailResponse = {
  booking: Booking
  payments: Payment[]
}

const bookingUpdateSchema = z.object({
  bookingStatus: z.string().min(1),
  paymentStatus: z.string().min(1),
  totalAmount: z.coerce.number().nonnegative(),
  advancePaid: z.coerce.number().nonnegative().optional(),
  eventDate: z.string().optional(),
  eventTimeStart: z.string().optional(),
  eventTimeEnd: z.string().optional(),
  venueArea: z.string().optional(),
  specialRequirements: z.string().optional()
})

type BookingUpdateForm = z.infer<typeof bookingUpdateSchema>

export default function BookingDetailPage() {
  const { id } = useParams()
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const query = useQuery<BookingDetailResponse>({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id ?? ''),
    enabled: Boolean(id)
  })
  const booking = query.data?.booking
  const payments = query.data?.payments ?? []

  const { register, handleSubmit, reset, formState } = useForm<BookingUpdateForm>({
    resolver: zodResolver(bookingUpdateSchema),
    defaultValues: {
      bookingStatus: booking?.bookingStatus ?? 'pending',
      paymentStatus: booking?.paymentStatus ?? 'pending',
      totalAmount: booking?.totalAmount ?? 0,
      advancePaid: booking?.advancePaid ?? 0,
      eventDate: booking?.eventDate,
      eventTimeStart: booking?.eventTimeStart,
      eventTimeEnd: booking?.eventTimeEnd,
      venueArea: booking?.venueArea,
      specialRequirements: booking?.specialRequirements
    }
  })

  useEffect(() => {
    if (booking) {
      reset({
        bookingStatus: booking.bookingStatus ?? 'pending',
        paymentStatus: booking.paymentStatus ?? 'pending',
        totalAmount: booking.totalAmount ?? 0,
        advancePaid: booking.advancePaid ?? 0,
        eventDate: booking.eventDate,
        eventTimeStart: booking.eventTimeStart,
        eventTimeEnd: booking.eventTimeEnd,
        venueArea: booking.venueArea,
        specialRequirements: booking.specialRequirements
      })
    }
  }, [booking, reset])

  const updateMutation = useMutation({
    mutationFn: (values: BookingUpdateForm) => updateBooking(id ?? '', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['booking', id] })
      toast.success('Booking updated successfully')
      setIsEditing(false)
    }
  })

  const handleUpdate = async (values: BookingUpdateForm) => {
    await updateMutation.mutateAsync(values)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Ref No</p>
              <h1 className="text-3xl font-semibold text-navy">{booking?.bookingRef}</h1>
            </div>
            <span className="rounded-3xl bg-slate-100 px-4 py-2 text-slate-700">{booking?.bookingStatus}</span>
          </div>
          {booking ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Client</p>
                <p className="mt-2 text-xl font-semibold text-navy">{booking.clientName}</p>
                <p className="text-slate-600">{booking.phone}</p>
                <p className="text-slate-600">{booking.email}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Event Details</p>
                <p className="mt-2 text-xl font-semibold text-navy">{booking.eventType}</p>
                <p className="text-slate-600">{booking.eventDate ? formatDate(booking.eventDate) : 'TBD'}</p>
                <p className="text-slate-600">{booking.eventTimeStart ?? 'TBD'} - {booking.eventTimeEnd ?? 'TBD'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Numbers</p>
                <p className="mt-2 text-xl font-semibold text-navy">{booking.guestCount || '—'}</p>
                <p className="text-slate-600">{booking.venueArea}</p>
                <p className="text-slate-600">{formatCurrency(booking.totalAmount)}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Loading booking details…</p>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-navy">Booking Details</h2>
            <button
              onClick={() => setIsEditing((visible) => !visible)}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Booking'}
            </button>
          </div>

          {isEditing && booking ? (
            <form onSubmit={handleSubmit(handleUpdate)} className="mt-6 grid gap-4 md:grid-cols-2">
              <input {...register('bookingStatus')} placeholder="Booking status" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input {...register('paymentStatus')} placeholder="Payment status" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="date" {...register('eventDate')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="time" {...register('eventTimeStart')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="time" {...register('eventTimeEnd')} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input {...register('venueArea')} placeholder="Venue area" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="number" step="0.01" {...register('totalAmount')} placeholder="Total amount" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="number" step="0.01" {...register('advancePaid')} placeholder="Advance paid" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <textarea {...register('specialRequirements')} placeholder="Special requirements" className="col-span-full rounded-2xl border border-slate-200 px-4 py-3" rows={4} />
              <button type="submit" disabled={formState.isSubmitting} className="col-span-full rounded-2xl bg-gold px-5 py-3 font-semibold text-navy">
                Save Changes
              </button>
            </form>
          ) : null}

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-navy">Payment History</h3>
            <div className="mt-4 space-y-3">
              {payments.length ? (
                payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-navy">{formatCurrency(payment.amount)}</p>
                    <p className="text-slate-500">{payment.method} • {formatDate(payment.paidAt)}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No payments recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
