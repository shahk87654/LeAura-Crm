import { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { AppShell } from '../components/layout/AppShell'
import { useQuery } from '@tanstack/react-query'
import { getCalendarEvents } from '../api/calendar.api'
import { type CalendarEvent } from '../types'

export default function CalendarPage() {
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth')
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 30)
  const eventsQuery = useQuery<CalendarEvent[]>({
    queryKey: ['calendar', start.toISOString(), end.toISOString()],
    queryFn: () => getCalendarEvents(start.toISOString(), end.toISOString())
  })

  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy">Calendar</h2>
            <p className="text-slate-500">View bookings and follow-ups in a single calendar.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('dayGridMonth')} className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700">
              Month
            </button>
            <button onClick={() => setView('timeGridWeek')} className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700">
              Week
            </button>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            events={events}
            headerToolbar={{ left: 'title', center: '', right: 'dayGridMonth,timeGridWeek' }}
            height={650}
          />
        </div>
      </div>
    </AppShell>
  )
}
