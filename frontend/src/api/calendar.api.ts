import api from './axios'
import { type CalendarEvent } from '../types'

export async function getCalendarEvents(start: string, end: string) {
  const response = await api.get<{ success: boolean; data: CalendarEvent[] }>('/calendar/events', { params: { start, end } })
  return response.data.data
}
