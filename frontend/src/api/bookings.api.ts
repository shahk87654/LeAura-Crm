import api from './axios'
import { type Booking, type PaginatedResponse, type Payment } from '../types'

interface BookingQuery {
  page?: number
  limit?: number
  status?: string
  venueArea?: string
  manager?: string
  paymentStatus?: string
  search?: string
  startDate?: string
  endDate?: string
}

export async function getBookings(query: BookingQuery) {
  const response = await api.get<{ success: boolean; data: PaginatedResponse<Booking> }>('/bookings', { params: query })
  return response.data.data
}

export async function getBooking(id: string) {
  const response = await api.get<{ success: boolean; data: { booking: Booking; payments: Payment[] } }>(`/bookings/${id}`)
  return response.data.data
}

export async function createBooking(payload: Partial<Booking>) {
  const response = await api.post<{ success: boolean; data: Booking }>('/bookings', payload)
  return response.data.data
}

export async function updateBooking(id: string, payload: Partial<Booking>) {
  const response = await api.put<{ success: boolean; data: Booking }>(`/bookings/${id}`, payload)
  return response.data.data
}

export async function patchBookingStatus(id: string, bookingStatus: string) {
  const response = await api.patch<{ success: boolean; data: Booking }>(`/bookings/${id}/status`, { bookingStatus })
  return response.data.data
}
