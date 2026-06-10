import api from './axios'
import { type PaginatedResponse, type FollowUp } from '../types'

interface FollowUpQuery {
  page?: number
  limit?: number
  status?: string
  type?: string
  manager?: string
  lead?: string
  startDate?: string
  endDate?: string
}

export async function getFollowUps(query: FollowUpQuery) {
  const response = await api.get<{ success: boolean; data: PaginatedResponse<FollowUp> }>('/followups', { params: query })
  return response.data.data
}

export async function getTodayFollowUps() {
  const response = await api.get<{ success: boolean; data: FollowUp[] }>('/followups/today')
  return response.data.data
}

export async function getOverdueFollowUps() {
  const response = await api.get<{ success: boolean; data: FollowUp[] }>('/followups/overdue')
  return response.data.data
}

export interface CreateFollowUpPayload {
  lead: string
  type: string
  scheduledAt: string
  notes?: string
}

export async function createFollowUp(payload: CreateFollowUpPayload) {
  const response = await api.post<{ success: boolean; data: FollowUp }>('/followups', payload)
  return response.data.data
}

export async function updateFollowUp(id: string, payload: Partial<FollowUp>) {
  const response = await api.put<{ success: boolean; data: FollowUp }>(`/followups/${id}`, payload)
  return response.data.data
}

export async function getFollowUpHistory(leadId: string) {
  const response = await api.get<{ success: boolean; data: { lead: any; followUps: FollowUp[]; booking: any } }>(`/followups/history/${leadId}`)
  return response.data.data
}
