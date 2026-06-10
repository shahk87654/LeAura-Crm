import api from './axios'
import { type Payment } from '../types'

export interface CreatePaymentPayload {
  booking: string
  amount: number
  method: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'check'
  transactionId?: string
  notes?: string
}

export async function getPaymentsForBooking(bookingId: string) {
  const response = await api.get<{ success: boolean; data: Payment[] }>(`/payments/booking/${bookingId}`)
  return response.data.data
}

export async function createPayment(payload: CreatePaymentPayload) {
  const response = await api.post<{ success: boolean; data: Payment }>('/payments', payload)
  return response.data.data
}

export async function deletePayment(paymentId: string) {
  const response = await api.delete<{ success: boolean; data: { id: string } }>(`/payments/${paymentId}`)
  return response.data.data
}
