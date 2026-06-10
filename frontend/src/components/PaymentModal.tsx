import { Modal } from './Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  paymentMethod: z.string().min(1, 'Payment method required'),
  transactionId: z.string().optional(),
  notes: z.string().optional()
})

type PaymentForm = z.infer<typeof paymentSchema>

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PaymentForm) => Promise<void>
  isLoading?: boolean
  bookingId: string
  remainingAmount?: number
  totalAmount?: number
}

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  remainingAmount = 0,
  totalAmount = 0
}: PaymentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      paymentMethod: 'cash'
    }
  })

  const amount = watch('amount')

  const handleFormSubmit = async (data: PaymentForm) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <div className="mb-6 space-y-2 rounded-lg bg-slate-900/50 p-4 border border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Total Amount</span>
          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Remaining Due</span>
          <span className={`font-semibold ${remainingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {formatCurrency(Math.max(0, remainingAmount))}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Payment Amount</label>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
          {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>}
          {amount > remainingAmount && (
            <p className="text-amber-400 text-sm mt-1">⚠️ Amount exceeds remaining balance</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <select
            {...register('paymentMethod')}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank-transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="check">Check</option>
            <option value="other">Other</option>
          </select>
          {errors.paymentMethod && <p className="text-red-400 text-sm mt-1">{errors.paymentMethod.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Transaction ID (Optional)</label>
          <input
            {...register('transactionId')}
            placeholder="e.g., TXN123456789"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
          <textarea
            {...register('notes')}
            placeholder="Any additional notes about this payment..."
            rows={2}
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
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            Record Payment
          </button>
        </div>
      </form>
    </Modal>
  )
}
