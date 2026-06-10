import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Calendar, ChevronLeft, ChevronRight, X, Clock, MapPin, User, FileText } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { useQuery } from '@tanstack/react-query'
import { getCalendarEvents } from '../api/calendar.api'
import { type CalendarEvent } from '../types'

type CalendarEventMeta = CalendarEvent & {
  extendedProps: {
    type?: string
    clientName?: string
    location?: string
    notes?: string
  }
}

export default function CalendarPage() {
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventMeta | null>(null)
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() })
  const calendarRef = useRef<FullCalendar | null>(null)

  useEffect(() => {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + 60)
    setDateRange({ start, end })
  }, [])

  const eventsQuery = useQuery<CalendarEvent[]>({
    queryKey: ['calendar', dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => getCalendarEvents(dateRange.start.toISOString(), dateRange.end.toISOString()),
    refetchInterval: 30000
  })

  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data])

  const navigate = useNavigate()

  const handleEventClick = (info: any) => {
    const event = info.event
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start?.toISOString() ?? event.startStr,
      end: event.end?.toISOString() ?? event.endStr,
      color: event.backgroundColor || event.borderColor || '',
      extendedProps: event.extendedProps as Record<string, string | undefined>
    })
  }

  const handleChangeView = (nextView: 'dayGridMonth' | 'timeGridWeek') => {
    setView(nextView)
    calendarRef.current?.getApi().changeView(nextView)
  }

  const getEventTypeColor = (title: string) => {
    if (title.includes('booking')) return 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
    if (title.includes('follow-up') || title.includes('call') || title.includes('whatsapp')) return 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
    if (title.includes('visit') || title.includes('site')) return 'bg-violet-500/10 border-violet-400/30 text-violet-300'
    return 'bg-slate-500/10 border-slate-400/30 text-slate-300'
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_20%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full bg-cyan-500/10 p-2">
                  <Calendar className="text-cyan-300" size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Schedule Management</p>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
              <p className="mt-2 text-sm text-slate-300/90">View bookings and follow-ups in a unified timeline.</p>
              <p className="mt-3 text-xs text-cyan-300/70 font-semibold">● Live — {events.length} events</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleChangeView('dayGridMonth')} 
                className={`rounded-2xl px-5 py-3 font-semibold text-xs uppercase tracking-[0.2em] transition-all ${
                  view === 'dayGridMonth'
                    ? 'border border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-cyan-500/20 text-cyan-300 shadow-[0_8px_24px_rgba(34,211,238,0.15)]'
                    : 'border border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-600'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => handleChangeView('timeGridWeek')} 
                className={`rounded-2xl px-5 py-3 font-semibold text-xs uppercase tracking-[0.2em] transition-all ${
                  view === 'timeGridWeek'
                    ? 'border border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/30 to-fuchsia-500/20 text-fuchsia-300 shadow-[0_8px_24px_rgba(217,70,239,0.15)]'
                    : 'border border-slate-700 bg-slate-900/80 text-slate-400 hover:border-slate-600'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </section>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)] overflow-hidden">
          <style>{`
            .fc {
              --fc-page-bg-color: transparent;
              --fc-border-color: rgba(71, 85, 105, 0.3);
              --fc-button-bg-color: rgb(30, 41, 59);
              --fc-button-border-color: rgba(71, 85, 105, 0.5);
              --fc-button-hover-bg-color: rgb(51, 65, 85);
              --fc-button-hover-border-color: rgba(71, 85, 105, 0.7);
              --fc-button-active-bg-color: rgb(51, 65, 85);
              --fc-button-active-border-color: rgba(34, 211, 238, 0.5);
              --fc-event-bg-color: rgba(34, 211, 238, 0.15);
              --fc-event-border-color: rgba(34, 211, 238, 0.4);
              --fc-event-text-color: rgb(165, 243, 252);
              --fc-today-bg-color: rgba(34, 211, 238, 0.08);
              --fc-col-header-text-color: rgb(148, 163, 184);
            }

            .fc .fc-button-primary:not(:disabled).fc-button-active {
              background-color: rgba(34, 211, 238, 0.2);
              border-color: rgba(34, 211, 238, 0.5);
              color: rgb(34, 211, 238);
            }

            .fc .fc-daygrid-day {
              border-color: rgba(71, 85, 105, 0.2);
            }

            .fc .fc-daygrid-day-number {
              color: rgb(148, 163, 184);
              padding: 8px;
            }

            .fc .fc-col-header-cell {
              background-color: rgba(15, 23, 42, 0.5);
              border-color: rgba(71, 85, 105, 0.3);
              padding: 10px 0;
              color: rgb(148, 163, 184);
            }

            .fc .fc-daygrid-day-frame {
              min-height: 100px;
            }

            .fc .fc-event {
              border-radius: 8px;
              border: 1px solid rgba(34, 211, 238, 0.4);
              background: linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%);
              box-shadow: 0 4px 12px rgba(34, 211, 238, 0.15);
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .fc .fc-event:hover {
              box-shadow: 0 6px 20px rgba(34, 211, 238, 0.3);
              transform: translateY(-2px);
            }

            .fc .fc-event-title {
              font-weight: 600;
              font-size: 12px;
              color: rgb(165, 243, 252);
              padding: 4px 8px;
            }

            .fc .fc-timegrid-slot {
              height: 2.5em;
            }

            .fc-timegrid-slot {
              border-color: rgba(71, 85, 105, 0.15);
            }

            .fc .fc-timegrid-slot {
              color: rgb(100, 116, 139);
            }

            .fc .fc-daygrid-day.fc-day-other {
              background-color: rgba(15, 23, 42, 0.3);
            }

            .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
              color: rgb(100, 116, 139);
            }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            events={events}
            headerToolbar={false}
            height="auto"
            contentHeight="auto"
            ref={calendarRef}
            slotLabelFormat={{ hour: 'numeric', meridiem: 'short' }}
            eventClick={handleEventClick}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <h3 className="text-sm font-semibold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.slice(0, 8).map((event, idx) => {
                  const eventDate = new Date(event.start)
                  const isToday = eventDate.toDateString() === new Date().toDateString()
                  const isSoon = eventDate.getTime() - Date.now() < 24 * 60 * 60 * 1000
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full flex items-start gap-3 rounded-2xl border border-slate-800/50 bg-slate-900/50 p-4 hover:border-cyan-400/30 hover:bg-slate-900 transition-all text-left group"
                    >
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${isToday ? 'bg-emerald-400 animate-pulse' : isSoon ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">{event.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{eventDate.toLocaleString()}</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${getEventTypeColor(event.title)}`}>
                        {isToday ? 'Today' : isSoon ? 'Soon' : 'Scheduled'}
                      </span>
                    </button>
                  )
                })
              ) : (
                <p className="text-xs text-slate-400">No upcoming events.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Stats</h3>
              {eventsQuery.isRefetching && <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />}
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                <p className="text-xs text-cyan-300/70 uppercase tracking-[0.15em]">Total Events</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-300">{events.length}</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/20 p-3">
                <p className="text-xs text-emerald-300/70 uppercase tracking-[0.15em]">Today</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  {events.filter(e => new Date(e.start).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 border border-amber-400/20 p-3">
                <p className="text-xs text-amber-300/70 uppercase tracking-[0.15em]">This Week</p>
                <p className="mt-2 text-2xl font-semibold text-amber-300">
                  {events.filter(e => {
                    const eventDate = new Date(e.start)
                    const weekStart = new Date()
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                    const weekEnd = new Date(weekStart)
                    weekEnd.setDate(weekEnd.getDate() + 7)
                    return eventDate >= weekStart && eventDate < weekEnd
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.45)] p-8 max-w-md w-full space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{selectedEvent.title}</h2>
                <p className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full inline-block ${getEventTypeColor(selectedEvent.title)}`}>
                  {selectedEvent.extendedProps?.type || 'Event'}
                </p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedEvent.start && (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-cyan-300" />
                  <div>
                    <p className="text-slate-400">Date & Time</p>
                    <p className="text-white font-semibold">{new Date(selectedEvent.start).toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              {selectedEvent.extendedProps?.clientName && (
                <div className="flex items-center gap-3">
                  <User size={16} className="text-violet-300" />
                  <div>
                    <p className="text-slate-400">Client</p>
                    <p className="text-white font-semibold">{selectedEvent.extendedProps.clientName}</p>
                  </div>
                </div>
              )}

              {selectedEvent.extendedProps?.location && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-emerald-300" />
                  <div>
                    <p className="text-slate-400">Location</p>
                    <p className="text-white font-semibold">{selectedEvent.extendedProps.location}</p>
                  </div>
                </div>
              )}

              {selectedEvent.extendedProps?.notes && (
                <div className="flex gap-3">
                  <FileText size={16} className="text-amber-300 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-slate-400">Notes</p>
                    <p className="text-white font-semibold">{selectedEvent.extendedProps.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              {selectedEvent.extendedProps?.type === 'booking' && (
                <button
                  onClick={() => navigate(`/bookings/${selectedEvent.id}`)}
                  className="w-full rounded-2xl bg-cyan-500 text-slate-950 px-4 py-3 font-semibold transition-colors hover:bg-cyan-400"
                >
                  Open Booking
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}


