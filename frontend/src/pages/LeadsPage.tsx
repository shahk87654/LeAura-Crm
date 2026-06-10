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
import { sourceOptions, eventTypeOptions, venueAreas, priorities, stages, stageLabels, stageColors } from '../utils/constants'
import { type Lead, type PaginatedResponse } from '../types'
import { ExportMenu } from '../components/ExportMenu'
import { exportToCSV, exportTableToPDF, printContent, formatLeadForExport } from '../utils/exportUtils'

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
  stage: z.enum(stages).default('new'),
  priority: z.enum(priorities),
  notes: z.string().optional()
})

type LeadForm = z.infer<typeof leadSchema>

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      stage: 'new'
    }
  })

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

  const handleExportCSV = () => {
    const data = items.map(formatLeadForExport)
    exportToCSV(data, `leads-${new Date().getTime()}`)
  }

  const handleExportPDF = () => {
    const columns = [
      { key: 'Lead Name', label: 'Name' },
      { key: 'Phone', label: 'Phone' },
      { key: 'Event Type', label: 'Event' },
      { key: 'Stage', label: 'Stage' },
      { key: 'Priority', label: 'Priority' }
    ]
    const data = items.map(formatLeadForExport)
    exportTableToPDF(data, columns, `leads-${new Date().getTime()}`, 'Leads Report')
  }

  const handlePrint = () => {
    printContent('leads-table', 'Leads Report')
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_18%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Pipeline Management</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Leads</h1>
              <p className="mt-2 max-w-lg text-sm text-slate-300/90">Manage your pipeline and schedule follow-ups.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
              <ExportMenu
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onPrint={handlePrint}
                isLoading={leadsQuery.isLoading}
              />
              <button onClick={() => setShowForm((value) => !value)} className="relative rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 px-6 py-3 font-semibold text-cyan-300 shadow-[0_8px_24px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-400/40 hover:shadow-[0_12px_32px_rgba(34,211,238,0.25)]">
                {showForm ? 'Close Form' : 'Add Lead'}
              </button>
            </div>
          </div>
        </section>

        {showForm && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <h3 className="text-xl font-semibold text-white">New Lead</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <input placeholder="Full name *" {...register('fullName')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" />
                {formState.errors.fullName && <p className="mt-2 text-xs text-red-400">{formState.errors.fullName.message}</p>}
              </div>
              <div>
                <input placeholder="Phone *" {...register('phone')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" />
                {formState.errors.phone && <p className="mt-2 text-xs text-red-400">{formState.errors.phone.message}</p>}
              </div>
              <div>
                <input placeholder="Email" {...register('email')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" />
                {formState.errors.email && <p className="mt-2 text-xs text-red-400">{formState.errors.email.message}</p>}
              </div>
              <div>
                <select {...register('source')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                  <option value="">Select source</option>
                  {sourceOptions.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.source && <p className="mt-2 text-xs text-red-400">{formState.errors.source.message}</p>}
              </div>
              <div>
                <select {...register('eventType')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                  <option value="">Select event type</option>
                  {eventTypeOptions.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.eventType && <p className="mt-2 text-xs text-red-400">{formState.errors.eventType.message}</p>}
              </div>
              <div>
                <input type="date" {...register('eventDate')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" />
                {formState.errors.eventDate && <p className="mt-2 text-xs text-red-400">{formState.errors.eventDate.message}</p>}
              </div>
              <div>
                <input type="number" placeholder="Guest count" {...register('guestCount')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" />
                {formState.errors.guestCount && <p className="mt-2 text-xs text-red-400">{formState.errors.guestCount.message}</p>}
              </div>
              <div>
                <input placeholder="Budget range" {...register('budgetRange')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" />
                {formState.errors.budgetRange && <p className="mt-2 text-xs text-red-400">{formState.errors.budgetRange.message}</p>}
              </div>
              <div>
                <select {...register('venueArea')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                  <option value="">Select venue area</option>
                  {venueAreas.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.venueArea && <p className="mt-2 text-xs text-red-400">{formState.errors.venueArea.message}</p>}
              </div>
              <div>
                <select {...register('stage')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                  <option value="">Select stage</option>
                  {stages.map((value) => (
                    <option key={value} value={value}>{stageLabels[value]}</option>
                  ))}
                </select>
                {formState.errors.stage && <p className="mt-2 text-xs text-red-400">{formState.errors.stage.message}</p>}
              </div>
              <div>
                <select {...register('priority')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                  <option value="">Select priority</option>
                  {priorities.map((value) => (<option key={value} value={value}>{value}</option>))}
                </select>
                {formState.errors.priority && <p className="mt-2 text-xs text-red-400">{formState.errors.priority.message}</p>}
              </div>
              <div className="col-span-full">
                <textarea placeholder="Notes" {...register('notes')} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" rows={4} />
                {formState.errors.notes && <p className="mt-2 text-xs text-red-400">{formState.errors.notes.message}</p>}
              </div>
              <button type="submit" disabled={formState.isSubmitting} className="col-span-full rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/30 to-cyan-500/20 px-6 py-3 font-semibold text-cyan-300 shadow-[0_8px_24px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-400/40 hover:shadow-[0_12px_32px_rgba(34,211,238,0.25)] disabled:opacity-50 disabled:cursor-not-allowed">
                {formState.isSubmitting ? 'Creating...' : 'Create Lead'}
              </button>
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Leads Pipeline</h3>
              <p className="text-sm text-slate-400">{items.length} leads in your pipeline</p>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">Live</span>
          </div>

          {/* Printable Table */}
          <div id="leads-table" className="hidden">
            <h2 className="text-2xl font-bold mb-4">Leads Report</h2>
            <p className="text-sm text-slate-600 mb-6">Generated on {new Date().toLocaleDateString()}</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-400">
                  <th className="text-left p-2 font-bold">Client Name</th>
                  <th className="text-left p-2 font-bold">Phone</th>
                  <th className="text-left p-2 font-bold">Event</th>
                  <th className="text-left p-2 font-bold">Stage</th>
                  <th className="text-left p-2 font-bold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-200">
                    <td className="p-2 font-semibold">{lead.fullName}</td>
                    <td className="p-2">{lead.phone}</td>
                    <td className="p-2">{lead.eventType}</td>
                    <td className="p-2">{lead.stage}</td>
                    <td className="p-2">{lead.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Display Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Client Name</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Event</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Date</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Source</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">Stage</th>
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr
                    key={lead.id}
                    className="cursor-pointer border-b border-slate-800/50 transition-all hover:border-slate-800 hover:bg-slate-900/80"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <td className="px-4 py-4 text-white">{lead.fullName}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{lead.eventType}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{lead.eventDate ? formatDate(lead.eventDate) : 'TBD'}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300">{lead.source}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${stageColors[lead.stage] ?? 'bg-amber-500/10 text-amber-300'}`}>
                        {stageLabels[lead.stage] ?? lead.stage}
                      </span>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">No leads found. Create your first lead to get started.</td>
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
