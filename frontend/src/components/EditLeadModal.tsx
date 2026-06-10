import { Modal } from './Modal'
import { Lead } from '../types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader } from 'lucide-react'
import { stages, stageLabels } from '../utils/constants'

const leadEditSchema = z.object({
  fullName: z.string().min(1, 'Full name required'),
  phone: z.string().min(1, 'Phone required'),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().min(1, 'Source required'),
  eventType: z.string().min(1, 'Event type required'),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().nonnegative().optional(),
  budgetRange: z.string().optional(),
  venueArea: z.string().min(1, 'Venue area required'),
  stage: z.string().min(1, 'Stage required'),
  priority: z.string().min(1, 'Priority required'),
  notes: z.string().optional()
})

type LeadEditForm = z.infer<typeof leadEditSchema>

interface EditLeadModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | undefined
  onSubmit: (data: LeadEditForm) => Promise<void>
  isLoading?: boolean
}

export function EditLeadModal({ isOpen, onClose, lead, onSubmit, isLoading = false }: EditLeadModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LeadEditForm>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: lead
      ? {
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          eventType: lead.eventType,
          eventDate: lead.eventDate,
          guestCount: lead.guestCount,
          budgetRange: lead.budgetRange,
          venueArea: lead.venueArea,
          stage: lead.stage,
          priority: lead.priority,
          notes: lead.notes
        }
      : {}
  })

  const handleFormSubmit = async (data: LeadEditForm) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Lead" size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid gap-4 grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              {...register('fullName')}
              placeholder="Enter full name"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
            {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
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
            <label className="block text-sm font-medium mb-2">Source</label>
            <select
              {...register('source')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select source</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="phone">Phone</option>
              <option value="social-media">Social Media</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </select>
            {errors.source && <p className="text-red-400 text-sm mt-1">{errors.source.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Event Type</label>
            <select
              {...register('eventType')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select event type</option>
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate Event</option>
              <option value="birthday">Birthday Party</option>
              <option value="conference">Conference</option>
              <option value="other">Other</option>
            </select>
            {errors.eventType && <p className="text-red-400 text-sm mt-1">{errors.eventType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Event Date</label>
            <input
              {...register('eventDate')}
              type="date"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Guest Count</label>
            <input
              {...register('guestCount')}
              type="number"
              placeholder="Estimated guest count"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Budget Range</label>
            <select
              {...register('budgetRange')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select budget</option>
              <option value="below-50k">Below 50K</option>
              <option value="50k-100k">50K - 100K</option>
              <option value="100k-500k">100K - 500K</option>
              <option value="above-500k">Above 500K</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Venue Area</label>
            <select
              {...register('venueArea')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select venue</option>
              <option value="downtown">Downtown</option>
              <option value="riverside">Riverside</option>
              <option value="hillside">Hillside</option>
              <option value="beachfront">Beachfront</option>
              <option value="other">Other</option>
            </select>
            {errors.venueArea && <p className="text-red-400 text-sm mt-1">{errors.venueArea.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stage</label>
            <select
              {...register('stage')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select stage</option>
              {stages.map((value) => (
                <option key={value} value={value}>{stageLabels[value]}</option>
              ))}
            </select>
            {errors.stage && <p className="text-red-400 text-sm mt-1">{errors.stage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              {...register('priority')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {errors.priority && <p className="text-red-400 text-sm mt-1">{errors.priority.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            {...register('notes')}
            placeholder="Any additional notes..."
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
