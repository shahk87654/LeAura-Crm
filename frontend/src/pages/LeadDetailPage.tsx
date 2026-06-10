import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { getLead, updateLead, updateLeadStage } from '../api/leads.api'
import ConfirmModal from '../components/ConfirmModal'
import LostReasonModal from '../components/LostReasonModal'
import { formatDate } from '../utils/formatters'
import { type FollowUp, type Lead } from '../types'
import { Phone, MessageCircle, Calendar, Plus, Edit } from 'lucide-react'
import { EditLeadModal } from '../components/EditLeadModal'
import { ExportMenu } from '../components/ExportMenu'
import { exportToCSV, exportHTMLToPDF, printContent, formatLeadForExport } from '../utils/exportUtils'

type LeadDetailResponse = {
  lead: Lead
  followups: FollowUp[]
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmTargetStage, setConfirmTargetStage] = useState<string | null>(null)
  const [isLostModalOpen, setIsLostModalOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const query = useQuery<LeadDetailResponse>({
    queryKey: ['lead', id],
    queryFn: () => getLead(id ?? ''),
    enabled: Boolean(id)
  })
  
  const lead = query.data?.lead

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof updateLead>[1]) => updateLead(id ?? '', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lead', id] })
      toast.success('Lead updated successfully')
      setIsEditModalOpen(false)
    }
  })

  const updateStageMutation = useMutation({
    mutationFn: (payload: any) => updateLeadStage(id ?? '', payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lead', id] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead stage updated')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || err?.message || 'Failed to update lead stage'
      toast.error(message)
    }
  })

  const handleChangeStage = async (stage: string) => {
    if (!lead) return
    setConfirmTargetStage(stage)
    setIsConfirmOpen(true)
  }

  const handleConfirm = async () => {
    const stage = confirmTargetStage
    setIsConfirmOpen(false)
    setConfirmTargetStage(null)
    if (!stage) return

    if (stage === 'lost') {
      setIsLostModalOpen(true)
      return
    }

    await updateStageMutation.mutateAsync({ stage })
  }

  const handleSubmitLost = async (reason?: string) => {
    setIsLostModalOpen(false)
    await updateStageMutation.mutateAsync({ stage: 'lost', lostReason: reason })
  }

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync(data)
  }

  const handleExportCSV = () => {
    if (lead) {
      exportToCSV([formatLeadForExport(lead)], `lead-${lead.id}`)
    }
  }

  const handleExportPDF = () => {
    exportHTMLToPDF('lead-detail-printable', `lead-${lead?.fullName?.replace(/\s+/g, '-')}`)
  }

  const handlePrint = () => {
    printContent('lead-detail-printable', `Lead: ${lead?.fullName}`)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.7)] border border-slate-800 text-white">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-slate-400">Lead</p>
              <h1 className="mt-2 text-3xl font-bold truncate">{lead?.fullName ?? 'Loading…'}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-white/3 px-3 py-1">{lead?.eventType ?? '—'}</span>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-white/3 px-3 py-1">{lead?.venueArea ?? '—'}</span>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-white/3 px-3 py-1">{lead?.stage ?? '—'}</span>
              </div>
              <div className="mt-4 text-sm text-slate-300">
                <p>{lead?.phone ?? 'No phone'}</p>
                <p>{lead?.email ?? 'No email'}</p>
              </div>
            </div>

            <div className="w-56 flex-shrink-0">
              <div className="rounded-2xl bg-slate-900/60 p-4 mb-4 text-center">
                <p className="text-xs text-slate-400">Follow-ups</p>
                <p className="mt-2 text-2xl font-semibold">{query.data?.followups?.length ?? 0}</p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-1">
                  <button onClick={() => void handleChangeStage('contacted')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/40">Contacted</button>
                  <button onClick={() => void handleChangeStage('proposal_sent')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/40">Proposal</button>
                  <button onClick={() => void handleChangeStage('won')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Mark Won</button>
                  <button onClick={() => void handleChangeStage('lost')} className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">Mark Lost</button>
                </div>
                <ExportMenu
                  onExportCSV={handleExportCSV}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                  isLoading={updateMutation.isPending}
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 transition-colors"
                >
                  <Edit size={16} /> Edit Lead
                </button>
                <button onClick={() => navigate('/bookings')} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition-colors">
                  <Plus size={16} /> Create Booking
                </button>
                <button onClick={() => navigate(`/followups?lead=${id}&create=1`)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-900/50 transition-colors">
                  <Calendar size={16} /> Add Follow-up
                </button>
                <a href={`tel:${lead?.phone ?? ''}`} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/6 px-4 py-2 text-slate-300 hover:bg-white/10 transition-colors">
                  <Phone size={16} /> Call
                </a>
                <a href={`https://wa.me/${lead?.phone ?? ''}`} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/6 px-4 py-2 text-slate-300 hover:bg-white/10 transition-colors">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Printable content for export */}
        <div id="lead-detail-printable" className="hidden">
          {lead && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Lead Details</h1>
                <p className="text-slate-600">{lead.fullName}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Contact</p>
                  <p className="font-semibold">{lead.fullName}</p>
                  <p className="text-sm text-slate-600">{lead.phone}</p>
                  <p className="text-sm text-slate-600">{lead.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Event Details</p>
                  <p className="font-semibold">{lead.eventType}</p>
                  <p className="text-sm text-slate-600">Budget: {lead.budgetRange || 'Not specified'}</p>
                  <p className="text-sm text-slate-600">Guests: {lead.guestCount || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Status</p>
                  <p className="font-semibold">{lead.stage}</p>
                  <p className="text-sm text-slate-600">Priority: {lead.priority}</p>
                  <p className="text-sm text-slate-600">{lead.venueArea}</p>
                </div>
              </div>

              {lead.notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Notes</p>
                  <p className="text-sm text-slate-700">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Follow-up History */}
        <div className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800 text-white">
          <h3 className="text-lg font-semibold">Follow-up History</h3>
          <div className="mt-4 space-y-3">
            {query.data?.followups?.map((followup) => (
              <div key={followup.id} className="rounded-2xl bg-slate-900/60 p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{followup.type}</p>
                    <p className="text-sm text-slate-300">{formatDate(followup.scheduledAt)}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1">
                    <span className={`h-2 w-2 rounded-full ${followup.status === 'completed' ? 'bg-emerald-400' : followup.status === 'pending' ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
                    <span className="text-sm text-slate-300">{followup.status}</span>
                  </div>
                </div>
                {followup.notes && <p className="mt-3 text-sm text-slate-400">{followup.notes}</p>}
              </div>
            ))}
            {!query.data?.followups?.length && <p className="text-slate-400">No follow-up history yet.</p>}
          </div>
        </div>

        {/* Lead Details Card */}
        <div className="rounded-3xl bg-slate-950/80 p-6 shadow-lg border border-slate-800 text-white">
          <h3 className="text-lg font-semibold mb-4">Lead Information</h3>
          <div className="grid gap-4 grid-cols-2">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Source</p>
              <p className="text-slate-200">{lead?.source || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Budget Range</p>
              <p className="text-slate-200">{lead?.budgetRange || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Guest Count</p>
              <p className="text-slate-200">{lead?.guestCount || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Assigned To</p>
              <p className="text-slate-200">{lead?.assignedTo?.name || 'Unassigned'}</p>
            </div>
          </div>
          {lead?.notes && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Notes</p>
              <p className="text-slate-300">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lead={lead}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void handleConfirm()}
        title="Change Lead Stage"
        message={`Are you sure you want to change this lead's stage to ${confirmTargetStage ?? ''}?`}
        confirmLabel="Yes, change"
      />
      <LostReasonModal isOpen={isLostModalOpen} onClose={() => setIsLostModalOpen(false)} onSubmit={reason => void handleSubmitLost(reason)} />
    </AppShell>
  )
}
