import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '../components/layout/AppShell'
import { getLead } from '../api/leads.api'
import { formatDate } from '../utils/formatters'
import { type FollowUp, type Lead } from '../types'

type LeadDetailResponse = {
  lead: Lead
  followups: FollowUp[]
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const query = useQuery<LeadDetailResponse>({
    queryKey: ['lead', id],
    queryFn: () => getLead(id ?? ''),
    enabled: Boolean(id)
  })
  const lead = query.data?.lead

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-navy">Lead details</h2>
          {lead ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Client</p>
                <p className="mt-2 text-xl font-semibold text-navy">{lead.fullName}</p>
                <p className="text-slate-600">{lead.phone}</p>
                <p className="text-slate-600">{lead.email}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Event</p>
                <p className="mt-2 text-xl font-semibold text-navy">{lead.eventType}</p>
                <p className="text-slate-600">{lead.venueArea}</p>
                <p className="text-slate-600">{lead.eventDate ? formatDate(lead.eventDate) : 'TBD'}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Loading lead details…</p>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-navy">Follow-up history</h3>
          <div className="mt-4 space-y-3">
            {query.data?.followups?.map((followup) => (
              <div key={followup.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-navy">{followup.type}</p>
                <p className="text-slate-600">{formatDate(followup.scheduledAt)}</p>
                <p className="text-slate-500">Status: {followup.status}</p>
              </div>
            ))}
            {!query.data?.followups?.length && <p className="text-slate-500">No follow-up history yet.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
