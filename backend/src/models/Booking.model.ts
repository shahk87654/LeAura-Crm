import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, unique: true, sparse: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    clientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    eventType: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    eventTimeStart: { type: String, trim: true },
    eventTimeEnd: { type: String, trim: true },
    guestCount: { type: Number },
    venueArea: { type: String, trim: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    customServices: [
      {
        name: { type: String, trim: true },
        price: { type: Number, min: 0 }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    bookingStatus: { type: String, enum: ['tentative', 'confirmed', 'completed', 'cancelled'], default: 'tentative' },
    specialRequirements: { type: String, trim: true },
    assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date }
  },
  { timestamps: true, strict: true }
)

bookingSchema.virtual('balanceDue').get(function (this: any) {
  return (this.totalAmount || 0) - (this.advancePaid || 0)
})

bookingSchema.set('toJSON', { virtuals: true })
bookingSchema.set('toObject', { virtuals: true })

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema)
