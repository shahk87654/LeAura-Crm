import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    source: {
      type: String,
      enum: ['walk_in', 'referral', 'instagram', 'facebook', 'website', 'phone', 'whatsapp', 'other'],
      default: 'other'
    },
    eventType: {
      type: String,
      enum: ['wedding', 'walima', 'mehndi', 'engagement', 'corporate', 'birthday', 'conference', 'other'],
      default: 'other'
    },
    eventDate: { type: Date },
    guestCount: { type: Number },
    budgetRange: { type: String, trim: true },
    venueArea: {
      type: String,
      enum: ['marquee', 'banquet_hall', 'rooftop', 'full_venue'],
      default: 'marquee'
    },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'visit_scheduled', 'proposal_sent', 'negotiating', 'won', 'lost'],
      default: 'new'
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
    lostReason: { type: String, trim: true },
    deletedAt: { type: Date }
  },
  { timestamps: true, strict: true }
)

leadSchema.set('toJSON', { virtuals: true })
leadSchema.set('toObject', { virtuals: true })

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema)
