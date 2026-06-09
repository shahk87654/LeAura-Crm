import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppShell } from '../components/layout/AppShell'
import { getFollowUps, getTodayFollowUps, getOverdueFollowUps, updateFollowUp } from '../api/followups.api'
import { formatDate } from '../utils/formatters'
import { type FollowUp, type PaginatedResponse } from '../types'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  completed: 'bg-emerald-100 text-emerald-700'
}

function getStatusStyle(status: string) {
  return statusStyles[status.toLowerCase()] ?? 'bg-slate-100 text-slate-600'
}

export default function FollowUpsPage() {
  const queryClient = useQueryClient()

  const todayQuery = useQuery<FollowUp[]>({ queryKey: ['followups', 'today'], queryFn: getTodayFollowUps })
  const overdueQuery = useQuery<FollowUp[]>({ queryKey: ['followups', 'overdue'], queryFn: getOverdueFollowUps })
  const upcomingQuery = useQuery<PaginatedResponse<FollowUp>>({
    queryKey: ['followups', { status: 'pending' }],
    queryFn: () => getFollowUps({ status: 'pending', page: 1, limit: 20 })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateFollowUp(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
    }
  })

  const todayCount = todayQuery.data?.length ?? 0
  const overdueCount = overdueQuery.data?.length ?? 0
  const upcomingCount = upcomingQuery.data?.total ?? 0

  const upcomingItems = useMemo(() => upcomingQuery.data?.items ?? [], [upcomingQuery.data])

  const markAsDone = async (id: string) => {
    await updateMutation.mutateAsync({ id, status: 'completed' })
  }

  const renderFollowUpCard = (item: FollowUp) => (
    <div key={item.id} className="rounded-3xl border border-slate-200 p-5 shadow-sm bg-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-navy">{item.lead?.fullName}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
              {item.status}
            </span>
          </div>
          <p className="text-sm text-slate-500">{item.type}</p>
        </div>
        <button
          type="button"
          onClick={() => void markAsDone(item.id)}
          disabled={item.status.toLowerCase() === 'completed' || updateMutation.isLoading}
          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Done
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
        <p>{item.notes ?? 'No additional notes provided.'}</p>
        <div className="flex flex-wrap items-center gap-3 text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            Due: {formatDate(item.scheduledAt)}
          </span>
          {item.lead?.id && (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              Lead ID: {item.lead.id.slice(-6)}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-navy">Follow-Ups</h2>
              <p className="mt-2 text-sm text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-rose-700">Overdue</p>
              <p className="mt-4 text-3xl font-semibold text-rose-900">{overdueCount}</p>
              <p className="mt-2 text-sm text-rose-600">Overdue follow-ups</p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-amber-700">Today's Follow-Ups</p>
              <p className="mt-4 text-3xl font-semibold text-amber-900">{todayCount}</p>
              <p className="mt-2 text-sm text-amber-600">Scheduled for today</p>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-700">Upcoming</p>
              <p className="mt-4 text-3xl font-semibold text-sky-900">{upcomingCount}</p>
              <p className="mt-2 text-sm text-sky-600">Pending follow-ups</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-rose-900">Overdue Follow-Ups</h3>
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-white px-3 py-1 text-sm font-semibold text-rose-700">
              {overdueCount}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {overdueQuery.data?.length ? overdueQuery.data.map(renderFollowUpCard) : <p className="text-slate-500">No overdue follow-ups.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-amber-900">Today's Follow-Ups</h3>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-semibold text-amber-700">
              {todayCount}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {todayQuery.data?.length ? todayQuery.data.map(renderFollowUpCard) : <p className="text-slate-500">No follow-ups scheduled for today.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-sky-900">Upcoming Follow-Ups</h3>
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-sm font-semibold text-sky-700">
              {upcomingCount}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {upcomingItems.length ? upcomingItems.map(renderFollowUpCard) : <p className="text-slate-500">No upcoming follow-ups.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
