import { Modal } from './Modal'
import { Booking } from '../types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader } from 'lucide-react'

const bookingEditSchema = z.object({
  clientName: z.string().min(1, 'Client name required'),
  phone: z.string().min(1, 'Phone required'),
  email: z.string().email().optional(),
  eventType: z.string().min(1, 'Event type required'),
  eventDate: z.string().min(1, 'Event date required'),
  eventTimeStart: z.string().optional(),
  eventTimeEnd: z.string().optional(),
  venueArea: z.string().min(1, 'Venue area required'),
  totalAmount: z.coerce.number().nonnegative(),
  advancePaid: z.coerce.number().nonnegative().optional(),
  bookingStatus: z.string().min(1, 'Booking status required'),
  paymentStatus: z.string().min(1, 'Payment status required'),
  specialRequirements: z.string().optional()
})

type BookingEditForm = z.infer<typeof bookingEditSchema>

interface EditBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | undefined
  onSubmit: (data: BookingEditForm) => Promise<void>
  isLoading?: boolean
}

export function EditBookingModal({ isOpen, onClose, booking, onSubmit, isLoading = false }: EditBookingModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BookingEditForm>({
    resolver: zodResolver(bookingEditSchema),
    defaultValues: booking
      ? {
          clientName: booking.clientName,
          phone: booking.phone,
          email: booking.email,
          eventType: booking.eventType,
          eventDate: booking.eventDate,
          eventTimeStart: booking.eventTimeStart,
          eventTimeEnd: booking.eventTimeEnd,
          venueArea: booking.venueArea,
          totalAmount: booking.totalAmount,
          advancePaid: booking.advancePaid,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          specialRequirements: booking.specialRequirements
        }
      : {}
  })

  const handleFormSubmit = async (data: BookingEditForm) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Booking" size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid gap-4 grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Client Name</label>
            <input
              {...register('clientName')}
              placeholder="Enter client name"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.clientName && <p className="text-red-400 text-sm mt-1">{errors.clientName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              {...register('phone')}
              placeholder="Enter phone number"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter email address"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Event Type</label>
            <input
              {...register('eventType')}
              placeholder="e.g., Wedding, Corporate Event"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.eventType && <p className="text-red-400 text-sm mt-1">{errors.eventType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Event Date</label>
            <input
              {...register('eventDate')}
              type="date"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.eventDate && <p className="text-red-400 text-sm mt-1">{errors.eventDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Venue Area</label>
            <input
              {...register('venueArea')}
              placeholder="e.g., Downtown, Riverside"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.venueArea && <p className="text-red-400 text-sm mt-1">{errors.venueArea.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              {...register('eventTimeStart')}
              type="time"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <input
              {...register('eventTimeEnd')}
              type="time"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Total Amount</label>
            <input
              {...register('totalAmount')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.totalAmount && <p className="text-red-400 text-sm mt-1">{errors.totalAmount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Advance Paid</label>
            <input
              {...register('advancePaid')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Booking Status</label>
            <select
              {...register('bookingStatus')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Status</label>
            <select
              {...register('paymentStatus')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Special Requirements</label>
          <textarea
            {...register('specialRequirements')}
            placeholder="Any special requirements or notes..."
            rows={3}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}
