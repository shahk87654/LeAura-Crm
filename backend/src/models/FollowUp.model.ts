import mongoose from 'mongoose'

const followUpSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['call', 'whatsapp', 'email', 'in_person', 'site_visit'],
      default: 'call'
    },
    scheduledAt: { type: Date, required: true },
    completedAt: { type: Date },
    status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' },
    outcome: {
      type: String,
      enum: ['no_answer', 'callback_requested', 'interested', 'not_interested', 'booked', 'rescheduled']
    },
    notes: { type: String, trim: true },
    nextFollowUpAt: { type: Date }
  },
  { timestamps: true, strict: true }
)

followUpSchema.set('toJSON', { virtuals: true })
followUpSchema.set('toObject', { virtuals: true })

export default mongoose.models.FollowUp || mongoose.model('FollowUp', followUpSchema)
