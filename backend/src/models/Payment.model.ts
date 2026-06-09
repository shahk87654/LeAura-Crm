import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'bank_transfer', 'cheque', 'card'], required: true },
    reference: { type: String, trim: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
    paidAt: { type: Date, default: Date.now }
  },
  { timestamps: true, strict: true }
)

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema)
