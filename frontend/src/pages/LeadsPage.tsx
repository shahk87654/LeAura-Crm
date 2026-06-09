import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { getLeads, createLead } from '../api/leads.api'
import { formatDate } from '../utils/formatters'
import { sourceOptions, eventTypeOptions, venueAreas, priorities } from '../utils/constants'
import { type Lead, type PaginatedResponse } from '../types'

const leadSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  source: z.enum(sourceOptions),
  eventType: z.enum(eventTypeOptions),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().int().positive().optional(),
  budgetRange: z.string().optional(),
  venueArea: z.enum(venueAreas),
  priority: z.enum(priorities),
  notes: z.string().optional()
})

type LeadForm = z.infer<typeof leadSchema>

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState } = useForm<LeadForm>({ resolver: zodResolver(leadSchema) })

  const leadsQuery = useQuery<PaginatedResponse<Lead>>({
    queryKey: ['leads', search],
    queryFn: () => getLeads({ search, page: 1, limit: 20 })
  })

  const navigate = useNavigate()
  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      reset()
      setShowForm(false)
      toast.success('Lead created successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to create lead'
      toast.error(message)
    }
  })

  const onSubmit = async (values: LeadForm) => {
    await createMutation.mutateAsync(values)
  }

  const items = leadsQuery.data?.items ?? []

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy">Leads</h2>
            <p className="text-sm text-slate-500">Manage your pipeline and schedule follow-ups.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            <button onClick={() => setShowForm((value) => !value)} className="rounded-2xl bg-gold px-5 py-3 font-semibold text-navy">
              {showForm ? 'Close Form' : 'Add Lead'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-navy">New Lead</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <input placeholder="Full name *" {...register('fullName')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                {formState.errors.fullName && <p className="mt-1 text-xs text-red-600">{formState.errors.fullName.message}</p>}
              </div>
              <div>
                <input placeholder="Phone *" {...register('phone')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                {formState.errors.phone && <p className="mt-1 text-xs text-red-600">{formState.errors.phone.message}</p>}
              </div>
              <div>
                <input placeholder="Email" {...register('email')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                {formState.errors.email && <p className="mt-1 text-xs text-red-600">{formState.errors.email.message}</p>}
              </div>
              <div>
                <select {...register('source')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="">Select source</option>
                  {sourceOptions.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.source && <p className="mt-1 text-xs text-red-600">{formState.errors.source.message}</p>}
              </div>
              <div>
                <select {...register('eventType')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="">Select event type</option>
                  {eventTypeOptions.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.eventType && <p className="mt-1 text-xs text-red-600">{formState.errors.eventType.message}</p>}
              </div>
              <div>
                <input type="date" {...register('eventDate')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                {formState.errors.eventDate && <p className="mt-1 text-xs text-red-600">{formState.errors.eventDate.message}</p>}
              </div>
              <div>
                <input type="number" placeholder="Guest count" {...register('guestCount')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                {formState.errors.guestCount && <p className="mt-1 text-xs text-red-600">{formState.errors.guestCount.message}</p>}
              </div>
              <div>
                <input placeholder="Budget range" {...register('budgetRange')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                {formState.errors.budgetRange && <p className="mt-1 text-xs text-red-600">{formState.errors.budgetRange.message}</p>}
              </div>
              <div>
                <select {...register('venueArea')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="">Select venue area</option>
                  {venueAreas.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.venueArea && <p className="mt-1 text-xs text-red-600">{formState.errors.venueArea.message}</p>}
              </div>
              <div>
                <select {...register('priority')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="">Select priority</option>
                  {priorities.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.priority && <p className="mt-1 text-xs text-red-600">{formState.errors.priority.message}</p>}
              </div>
              <div className="col-span-full">
                <textarea placeholder="Notes" {...register('notes')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" rows={4} />
                {formState.errors.notes && <p className="mt-1 text-xs text-red-600">{formState.errors.notes.message}</p>}
              </div>
              <button type="submit" disabled={formState.isSubmitting} className="col-span-full rounded-2xl bg-gold px-5 py-3 font-semibold text-navy disabled:opacity-50">
                {formState.isSubmitting ? 'Creating...' : 'Create Lead'}
              </button>
            </form>
          </div>
        )}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Stage</th>
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr
                key={lead.id}
                className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                <td className="px-4 py-4 text-slate-700">{lead.fullName}</td>
                <td className="px-4 py-4 text-slate-700">{lead.eventType}</td>
                <td className="px-4 py-4 text-slate-700">{lead.eventDate ? formatDate(lead.eventDate) : 'TBD'}</td>
                <td className="px-4 py-4 text-slate-700">{lead.source}</td>
                <td className="px-4 py-4 text-slate-700">{lead.stage}</td>
              </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No leads found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
