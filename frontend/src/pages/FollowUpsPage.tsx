import { useMemo, useState, useEffect, cloneElement, ReactElement } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, AlertCircle, Clock, ChevronRight, History, TrendingUp, Phone, Mail, Calendar, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { getFollowUps, getTodayFollowUps, getOverdueFollowUps, updateFollowUp, getFollowUpHistory, createFollowUp } from '../api/followups.api'
import { Modal } from '../components/Modal'
import { formatDate } from '../utils/formatters'
import { type FollowUp, type PaginatedResponse } from '../types'

const statusStyles: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  pending: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-400/20', icon: <Clock size={14} /> },
  overdue: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-400/20', icon: <AlertCircle size={14} /> },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-400/20', icon: <Check size={14} /> }
}

const leadStages = [
  { key: 'new', label: 'New', color: 'bg-slate-500/10 text-slate-300', icon: '📌' },
  { key: 'contacted', label: 'Contacted', color: 'bg-cyan-500/10 text-cyan-300', icon: <Phone size={16} /> },
  { key: 'interested', label: 'Interested', color: 'bg-violet-500/10 text-violet-300', icon: '✨' },
  { key: 'visit_scheduled', label: 'Visit Scheduled', color: 'bg-amber-500/10 text-amber-300', icon: <Calendar size={16} /> },
  { key: 'proposal_sent', label: 'Proposal Sent', color: 'bg-indigo-500/10 text-indigo-300', icon: <Mail size={16} /> },
  { key: 'negotiating', label: 'Negotiating', color: 'bg-fuchsia-500/10 text-fuchsia-300', icon: '💬' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500/10 text-emerald-300', icon: <CheckCircle2 size={16} /> },
  { key: 'lost', label: 'Lost', color: 'bg-red-500/10 text-red-300', icon: '💔' }
]

function getStatusStyle(status: string) {
  return statusStyles[status.toLowerCase()] ?? { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-400/20', icon: <Clock size={14} /> }
}

export default function FollowUpsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(() => searchParams.get('lead'))
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const leadFromQuery = searchParams.get('lead')
    const shouldCreate = searchParams.get('create') === '1'
    if (leadFromQuery) {
      setSelectedLeadId(leadFromQuery)
    }
    if (shouldCreate) {
      setShowCreateModal(true)
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('create')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const followUpTypes = ['call', 'whatsapp', 'email', 'in_person', 'site_visit'] as const

  const todayQuery = useQuery<FollowUp[]>({ 
    queryKey: ['followups', 'today'], 
    queryFn: getTodayFollowUps,
    refetchInterval: 30000
  })
  const overdueQuery = useQuery<FollowUp[]>({ 
    queryKey: ['followups', 'overdue'], 
    queryFn: getOverdueFollowUps,
    refetchInterval: 30000
  })
  const upcomingQuery = useQuery<PaginatedResponse<FollowUp>>({
    queryKey: ['followups', { status: 'pending', lead: selectedLeadId }],
    queryFn: () => getFollowUps({ status: 'pending', lead: selectedLeadId ?? undefined, page: 1, limit: 20 }),
    refetchInterval: 30000,
    enabled: true
  })

  const historyQuery = useQuery({
    queryKey: ['followups', 'history', selectedLeadId],
    queryFn: () => selectedLeadId ? getFollowUpHistory(selectedLeadId) : null,
    enabled: !!selectedLeadId,
    refetchInterval: 30000
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateFollowUp(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      if (selectedLeadId) {
        queryClient.invalidateQueries({ queryKey: ['followups', 'history', selectedLeadId] })
      }
    }
  })

  const followUpForm = useForm<{
    type: (typeof followUpTypes)[number]
    scheduledAt: string
    notes?: string
  }>({
    resolver: zodResolver(z.object({
      type: z.enum(followUpTypes),
      scheduledAt: z.string().min(1, 'Scheduled date is required'),
      notes: z.string().optional()
    })),
    defaultValues: {
      type: 'call',
      scheduledAt: '',
      notes: ''
    }
  })

  const {
    register: registerFollowUp,
    handleSubmit: handleSubmitFollowUp,
    reset: resetFollowUp,
    formState: { errors: followUpErrors, isSubmitting: followUpSubmitting }
  } = followUpForm

  const createMutation = useMutation({
    mutationFn: createFollowUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      if (selectedLeadId) {
        queryClient.invalidateQueries({ queryKey: ['followups', 'history', selectedLeadId] })
      }
      resetFollowUp({ type: 'call', scheduledAt: '', notes: '' })
      setShowCreateModal(false)
      toast.success('Follow-up created successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to create follow-up'
      toast.error(message)
    }
  })

  const onSubmitFollowUp = async (data: { type: (typeof followUpTypes)[number]; scheduledAt: string; notes?: string }) => {
    if (!selectedLeadId) {
      toast.error('Select a lead before creating a follow-up')
      return
    }
    await createMutation.mutateAsync({ lead: selectedLeadId, ...data })
  }

  const todayCount = todayQuery.data?.length ?? 0
  const overdueCount = overdueQuery.data?.length ?? 0
  const upcomingCount = upcomingQuery.data?.total ?? 0
  const upcomingItems = useMemo(() => upcomingQuery.data?.items ?? [], [upcomingQuery.data])

  const markAsDone = async (id: string) => {
    await updateMutation.mutateAsync({ id, status: 'completed' })
  }

  const renderFollowUpCard = (item: FollowUp) => {
    const style = getStatusStyle(item.status)
    return (
      <div 
        key={item.id} 
        className="group cursor-pointer rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.22)] transition-all hover:border-slate-700 hover:bg-slate-900"
        onClick={() => item.lead?.id && setSelectedLeadId(item.lead.id)}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold text-white">{item.lead?.fullName}</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full border ${style.border} ${style.bg} px-3 py-1.5 text-xs font-semibold ${style.text}`}>
                {style.icon}
                <span>{item.status}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-400">{item.type}</span>
              <span className="text-sm text-slate-400">Due: {formatDate(item.scheduledAt)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); void markAsDone(item.id) }}
            disabled={item.status.toLowerCase() === 'completed' || updateMutation.status === 'pending'}
            className="relative inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300 shadow-[0_6px_20px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/50 hover:shadow-[0_8px_28px_rgba(16,185,129,0.25)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Check size={16} />
            Mark Done
          </button>
        </div>
        <div className="mt-5 space-y-3">
          <p className="text-sm text-slate-300">{item.notes ?? 'No additional notes provided.'}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/50 text-xs text-slate-400">
            {item.lead?.id && <span>Lead ID: {item.lead.id.slice(-6)}</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_18%),radial-gradient(circle_at_bottom_left,_rgba(239,68,68,0.12),_transparent_20%)]" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Live Activity Stream</p>
              {(todayQuery.isRefetching || overdueQuery.isRefetching || upcomingQuery.isRefetching) && <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />}
            </div>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Follow-Ups</h1>
                <p className="mt-2 text-sm text-slate-300/90">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                {selectedLeadId && (
                  <p className="mt-2 text-sm text-cyan-300/90">Viewing follow-ups for selected lead <span className="font-semibold">{selectedLeadId.slice(-6)}</span></p>
                )}
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  disabled={!selectedLeadId}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create Follow-up
                </button>
                <div className="flex gap-3">
                  <div className="rounded-full bg-red-500/10 px-4 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-red-300">Overdue: {overdueCount}</p>
                  </div>
                  <div className="rounded-full bg-amber-500/10 px-4 py-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Today: {todayCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {selectedLeadId && historyQuery.data?.lead && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Selected Lead</p>
              <p className="text-lg font-semibold text-white">{historyQuery.data.lead.fullName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!selectedLeadId}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                Add Follow-up
              </button>
              <button
                onClick={() => {
                  setSelectedLeadId(null)
                  const np = new URLSearchParams(searchParams)
                  np.delete('lead')
                  setSearchParams(np, { replace: true })
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900/40"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-red-400/20 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-400/70">Overdue</p>
                <p className="mt-4 text-4xl font-semibold text-red-300">{overdueCount}</p>
              </div>
              <div className="rounded-full bg-red-500/10 p-3">
                <AlertCircle className="text-red-300" size={24} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">Requires immediate attention</p>
          </div>

          <div className="rounded-3xl border border-amber-400/20 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-400/70">Today</p>
                <p className="mt-4 text-4xl font-semibold text-amber-300">{todayCount}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Clock className="text-amber-300" size={24} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">Scheduled for today</p>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/70">Upcoming</p>
                <p className="mt-4 text-4xl font-semibold text-cyan-300">{upcomingCount}</p>
              </div>
              <div className="rounded-full bg-cyan-500/10 p-3">
                <Clock className="text-cyan-300" size={24} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">Pending follow-ups</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {selectedLeadId && (historyQuery.isLoading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)] animate-pulse">
              <div className="h-6 w-32 bg-slate-800 rounded-full mb-4" />
              <div className="h-4 w-48 bg-slate-800 rounded-full" />
            </div>
          ) : historyQuery.data ? (
            <div className="space-y-6">
              {/* Lead Journey - Enhanced Vertical Pipeline */}
              <div className="rounded-3xl border border-violet-400/40 bg-gradient-to-br from-violet-950/40 to-purple-950/40 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 p-3">
                      <TrendingUp size={24} className="text-violet-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Sales Pipeline</h3>
                      <p className="text-xs text-slate-400 mt-1">Customer Journey Map</p>
                    </div>
                  </div>
                  {historyQuery.isRefetching && <div className="h-3 w-3 rounded-full bg-violet-400 animate-pulse" />}
                </div>

                {/* Lead Profile Card */}
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-700/60 p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Current Lead</p>
                      <p className="text-2xl font-bold text-white mt-2">{historyQuery.data?.lead?.fullName ?? 'Unknown'}</p>
                    </div>
                    <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                      historyQuery.data?.lead?.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-400/40' :
                      historyQuery.data?.lead?.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    }`}>
                      {historyQuery.data?.lead?.priority} Priority
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-900/50 p-3">
                      <p className="text-xs text-slate-500 font-medium">Event Type</p>
                      <p className="text-sm font-bold text-cyan-300 mt-2 capitalize">{historyQuery.data?.lead?.eventType ?? 'N/A'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/50 p-3">
                      <p className="text-xs text-slate-500 font-medium">Budget</p>
                      <p className="text-sm font-bold text-emerald-300 mt-2">{historyQuery.data?.lead?.budgetRange ?? 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {(() => {
                  const currentStageIdx = leadStages.findIndex(s => s.key === historyQuery.data?.lead?.stage)
                  const progress = ((currentStageIdx + 1) / leadStages.length) * 100
                  return (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pipeline Progress</p>
                        <p className="text-xs font-bold text-violet-300">{Math.round(progress)}%</p>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })()}

                {/* Vertical Pipeline */}
                <div className="space-y-3">
                  {leadStages.map((stage, idx) => {
                    const currentStageIdx = leadStages.findIndex(s => s.key === historyQuery.data?.lead?.stage)
                    const isActive = currentStageIdx === idx
                    const isPassed = currentStageIdx > idx
                    const isNext = currentStageIdx === idx - 1
                    const showConnector = idx < leadStages.length - 1

                    return (
                      <div key={stage.key}>
                        <div className={`relative flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 border ${
                          isActive ? 'bg-gradient-to-r from-violet-500/25 to-purple-500/15 border-violet-400/50 shadow-lg shadow-violet-500/20 scale-105' :
                          isPassed ? 'bg-emerald-500/15 border-emerald-400/30' :
                          isNext ? 'bg-amber-500/15 border-amber-400/30' :
                          'bg-slate-900/30 border-slate-700/40'
                        }`}>
                          {/* Stage Indicator */}
                          <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                            isActive ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/50 scale-110' :
                            isPassed ? 'bg-emerald-500/80 text-emerald-50' :
                            isNext ? 'bg-amber-500/80 text-amber-50' :
                            'bg-slate-700/60 text-slate-400'
                          }`}>
                            {idx + 1}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              {/* Stage Icon */}
                              {typeof stage.icon === 'string' ? (
                                <span className="text-2xl">{stage.icon}</span>
                              ) : (
                                <div className={`text-2xl transition-transform ${isActive ? 'scale-125' : ''}`}>
                                  {cloneElement(stage.icon as ReactElement, {
                                    className: `${isActive ? 'text-violet-300' : isPassed ? 'text-emerald-300' : 'text-slate-400'}`,
                                    size: 20
                                  })}
                                </div>
                              )}
                              <span className={`font-bold transition-all ${
                                isActive ? 'text-violet-200 text-base' :
                                isPassed ? 'text-emerald-200' :
                                isNext ? 'text-amber-200' :
                                'text-slate-400 text-sm'
                              }`}>
                                {stage.label}
                              </span>
                            </div>
                            <p className={`text-xs ${isActive ? 'text-violet-300/80' : isPassed ? 'text-emerald-300/70' : 'text-slate-500'}`}>
                              {isActive ? 'Current Stage' : isPassed ? 'Completed' : isNext ? 'Next Stage' : 'Pending'}
                            </p>
                          </div>

                          {/* Status Badge */}
                          {isActive && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400/50">
                              <div className="h-2 w-2 rounded-full bg-violet-300 animate-pulse" />
                              <span className="text-xs font-bold text-violet-300">Active</span>
                            </div>
                          )}
                          {isPassed && <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />}
                        </div>

                        {/* Connector Line */}
                        {showConnector && (
                          <div className={`ml-6 h-3 w-0.5 transition-all ${
                            isPassed || isActive ? 'bg-gradient-to-b from-emerald-500 to-violet-500' :
                            'bg-slate-700/40'
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Booking Status */}
                {historyQuery.data?.booking && (
                  <div className="mt-8 rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={24} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-200">✅ Booking Confirmed</p>
                        <p className="text-xs text-emerald-300/80 mt-1">Reference: <span className="font-mono font-bold">{historyQuery.data.booking.bookingRef}</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-Up History */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <History size={16} className="text-cyan-400" />
                  Recent Follow-Ups
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {historyQuery.data?.followUps && historyQuery.data.followUps.length > 0 ? (
                    historyQuery.data.followUps.map((fu, idx) => {
                      const fStyle = getStatusStyle(fu.status)
                      return (
                        <div key={fu.id} className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-3 hover:border-slate-700/80 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${fStyle.bg} ${fStyle.text}`}>{fu.type}</span>
                              </div>
                              <p className="mt-1 text-xs text-slate-400 font-medium">{formatDate(fu.scheduledAt)}</p>
                              {fu.notes && <p className="mt-1 text-xs text-slate-400 line-clamp-2">{fu.notes}</p>}
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full border ${fStyle.border} ${fStyle.bg} px-2 py-1 text-xs whitespace-nowrap ${fStyle.text} flex-shrink-0`}>
                              {fStyle.icon}
                              <span className="font-semibold">{fu.status}</span>
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No follow-up history yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null)}

          <div className="space-y-6">
            {overdueCount > 0 && (
              <div className="rounded-3xl border border-red-400/20 bg-slate-950/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-500/10 p-2">
                      <AlertCircle className="text-red-400" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Overdue Follow-Ups</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {overdueQuery.isRefetching && <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />}
                    <span className="inline-flex items-center rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
                      {overdueCount}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {overdueQuery.data?.length ? overdueQuery.data.map(renderFollowUpCard) : <p className="text-slate-400">No overdue follow-ups.</p>}
                </div>
              </div>
            )}

            {todayCount > 0 && (
              <div className="rounded-3xl border border-amber-400/20 bg-slate-950/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-500/10 p-2">
                      <Clock className="text-amber-400" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Today's Follow-Ups</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {todayQuery.isRefetching && <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
                    <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
                      {todayCount}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {todayQuery.data?.length ? todayQuery.data.map(renderFollowUpCard) : <p className="text-slate-400">No follow-ups scheduled for today.</p>}
                </div>
              </div>
            )}

            {upcomingCount > 0 && (
              <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-cyan-500/10 p-2">
                      <Clock className="text-cyan-400" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Upcoming Follow-Ups</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {upcomingQuery.isRefetching && <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />}
                    <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
                      {upcomingCount}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {upcomingItems.length ? upcomingItems.map(renderFollowUpCard) : <p className="text-slate-400">No upcoming follow-ups.</p>}
                </div>
              </div>
            )}
          </div>

          {selectedLeadId && (historyQuery.isLoading ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)] animate-pulse">
                <div className="h-6 w-32 bg-slate-800 rounded-full mb-4" />
                <div className="h-4 w-48 bg-slate-800 rounded-full" />
              </div>
            </div>
          ) : null)}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Follow-up" size="md">
        <form onSubmit={handleSubmitFollowUp(onSubmitFollowUp)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Follow-up Type</label>
            <select
              {...registerFollowUp('type')}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            >
              {followUpTypes.map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            {followUpErrors.type && <p className="mt-2 text-xs text-red-400">{followUpErrors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Scheduled Date</label>
            <input
              {...registerFollowUp('scheduledAt')}
              type="datetime-local"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            />
            {followUpErrors.scheduledAt && <p className="mt-2 text-xs text-red-400">{followUpErrors.scheduledAt.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Notes</label>
            <textarea
              {...registerFollowUp('notes')}
              rows={4}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="rounded-2xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={followUpSubmitting}
              className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              {followUpSubmitting ? 'Creating...' : 'Create Follow-up'}
            </button>
          </div>
        </form>
      </Modal>
        </div>
      </div>
    </AppShell>
  )
}

