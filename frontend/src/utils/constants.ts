export const sourceOptions = ['walk_in', 'referral', 'instagram', 'facebook', 'website', 'phone', 'whatsapp', 'other'] as const
export const eventTypeOptions = ['wedding', 'walima', 'mehndi', 'engagement', 'corporate', 'birthday', 'conference', 'other'] as const
export const venueAreas = ['marquee', 'banquet_hall', 'rooftop', 'full_venue'] as const
export const stages = ['new', 'contacted', 'interested', 'visit_scheduled', 'proposal_sent', 'negotiating', 'won', 'lost'] as const
export const priorities = ['low', 'medium', 'high'] as const

export const stageLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  visit_scheduled: 'Visit Scheduled',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost'
}

export const stageColors: Record<string, string> = {
  new: 'bg-slate-200 text-slate-900',
  contacted: 'bg-blue-200 text-blue-900',
  interested: 'bg-violet-200 text-violet-900',
  visit_scheduled: 'bg-amber-200 text-amber-900',
  proposal_sent: 'bg-orange-200 text-orange-900',
  negotiating: 'bg-yellow-200 text-yellow-900',
  won: 'bg-emerald-200 text-emerald-900',
  lost: 'bg-red-200 text-red-900'
}
