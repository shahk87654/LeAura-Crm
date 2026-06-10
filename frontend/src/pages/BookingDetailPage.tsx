import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { getBooking, updateBooking } from '../api/bookings.api'
import { createPayment } from '../api/payments.api'
import { formatDate, formatCurrency } from '../utils/formatters'
import { type Booking, type Payment } from '../types'
import { Edit, Printer, DollarSign } from 'lucide-react'
import { EditBookingModal } from '../components/EditBookingModal'
import { PaymentModal } from '../components/PaymentModal'
import { ExportMenu } from '../components/ExportMenu'
import { exportToCSV, exportHTMLToPDF, printContent, formatBookingForExport } from '../utils/exportUtils'

type BookingDetailResponse = {
  booking: Booking
  payments: Payment[]
}

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const query = useQuery<BookingDetailResponse>({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id ?? ''),
    enabled: Boolean(id)
  })
  
  const booking = query.data?.booking
  const payments = query.data?.payments ?? []

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof updateBooking>[1]) => updateBooking(id ?? '', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['booking', id] })
      toast.success('Booking updated successfully')
      setIsEditModalOpen(false)
    }
  })

  const paymentMutation = useMutation({
    mutationFn: (values: any) => createPayment({
      booking: id ?? '',
      amount: values.amount,
      method: values.paymentMethod,
      transactionId: values.transactionId,
      notes: values.notes
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['booking', id] })
      toast.success('Payment recorded successfully')
      setIsPaymentModalOpen(false)
    }
  })

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync(data)
  }

  const handleRecordPayment = async (data: any) => {
    await paymentMutation.mutateAsync(data)
  }

  const remainingAmount = (booking?.totalAmount ?? 0) - (booking?.advancePaid ?? 0)

  const handleExportCSV = () => {
    if (booking) {
      exportToCSV([formatBookingForExport(booking)], `booking-${booking.bookingRef}`)
    }
  }

  const handleExportPDF = () => {
    exportHTMLToPDF('booking-detail-printable', `booking-${booking?.bookingRef}`)
  }

  const handlePrint = () => {
    printContent('booking-detail-printable', `Booking: ${booking?.bookingRef}`)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.7)] border border-slate-800 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Ref No</p>
              <h1 className="text-3xl font-bold">{booking?.bookingRef ?? '—'}</h1>
              <p className="mt-2 text-sm text-slate-300">{booking?.eventType} • {booking?.venueArea}</p>
            </div>
            <div className="flex items-center gap-3">
              <ExportMenu
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                isLoading={updateMutation.isPending}
              />
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 transition-colors"
              >
                <Edit size={16} /> Edit
              </button>
              <span className="rounded-2xl bg-emerald-500/20 px-4 py-2 text-emerald-300 font-semibold">{booking?.bookingStatus}</span>
            </div>
          </div>

          {booking ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-900/60 p-5">
                <p className="text-sm text-slate-400">Client</p>
                <p className="mt-2 text-xl font-semibold">{booking.clientName}</p>
                <p className="text-slate-300">{booking.phone}</p>
                <p className="text-slate-300">{booking.email}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/60 p-5">
                <p className="text-sm text-slate-400">Event Details</p>
                <p className="mt-2 text-xl font-semibold">{booking.eventType}</p>
                <p className="text-slate-300">{booking.eventDate ? formatDate(booking.eventDate) : 'TBD'}</p>
                <p className="text-slate-300">{booking.eventTimeStart ?? 'TBD'} - {booking.eventTimeEnd ?? 'TBD'}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/60 p-5">
                <p className="text-sm text-slate-400">Numbers</p>
                <p className="mt-2 text-xl font-semibold">{booking.guestCount || '—'}</p>
                <p className="text-slate-300">{booking.venueArea}</p>
                <p className="text-slate-300">{formatCurrency(booking.totalAmount)}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Loading booking details…</p>
          )}
        </div>

        {/* Printable content for export */}
        <div id="booking-detail-printable" className="hidden">
          {booking && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
                <p className="text-slate-600">Booking Ref: {booking.bookingRef}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Client</p>
                  <p className="font-semibold">{booking.clientName}</p>
                  <p className="text-sm text-slate-600">{booking.phone}</p>
                  <p className="text-sm text-slate-600">{booking.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Event Details</p>
                  <p className="font-semibold">{booking.eventType}</p>
                  <p className="text-sm text-slate-600">{booking.eventDate ? formatDate(booking.eventDate) : 'TBD'}</p>
                  <p className="text-sm text-slate-600">{booking.eventTimeStart} - {booking.eventTimeEnd}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Status</p>
                  <p className="font-semibold">{booking.bookingStatus}</p>
                  <p className="text-sm text-slate-600">{booking.paymentStatus}</p>
                  <p className="text-sm text-slate-600">{booking.venueArea}</p>
                </div>
              </div>

              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-semibold">Total Amount</td>
                    <td className="py-2 text-right">{formatCurrency(booking.totalAmount)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-semibold">Advance Paid</td>
                    <td className="py-2 text-right">{formatCurrency(booking.advancePaid ?? 0)}</td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="py-2">Remaining</td>
                    <td className="py-2 text-right">{formatCurrency(remainingAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Payment Status</h3>
              <p className="text-slate-300 mt-1">Total: {formatCurrency(booking?.totalAmount ?? 0)} • Paid: {formatCurrency(booking?.advancePaid ?? 0)} • Remaining: {formatCurrency(remainingAmount)}</p>
            </div>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <DollarSign size={16} /> Record Payment
            </button>
          </div>

          <div className="space-y-3">
            {payments.length ? (
              payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg bg-slate-900/60 p-4 border border-slate-700">
                  <div>
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-slate-400">{payment.method || 'N/A'} • {formatDate(payment.paidAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No payments recorded yet.</p>
            )}
          </div>
        </div>

        {/* Additional Details */}
        {booking?.specialRequirements && (
          <div className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800 text-white">
            <h3 className="text-lg font-semibold mb-4">Special Requirements</h3>
            <p className="text-slate-300">{booking.specialRequirements}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        booking={booking}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingId={id ?? ''}
        onSubmit={handleRecordPayment}
        isLoading={paymentMutation.isPending}
        totalAmount={booking?.totalAmount}
        remainingAmount={remainingAmount}
      />
    </AppShell>
  )
}
