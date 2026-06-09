import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    includes: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, strict: true }
)

export default mongoose.models.Package || mongoose.model('Package', packageSchema)
