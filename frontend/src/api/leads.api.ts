import api from './axios'
import { type Lead, type PaginatedResponse } from '../types'

interface LeadQuery {
  page?: number
  limit?: number
  stage?: string
  source?: string
  eventType?: string
  assignedTo?: string
  priority?: string
  search?: string
  startDate?: string
  endDate?: string
}

export async function getLeads(query: LeadQuery) {
  const response = await api.get<{ success: boolean; data: PaginatedResponse<Lead> }>('/leads', { params: query })
  return response.data.data
}

export async function getLead(id: string) {
  const response = await api.get<{ success: boolean; data: { lead: Lead; followups: any[] } }>(`/leads/${id}`)
  return response.data.data
}

export async function createLead(payload: Partial<Lead>) {
  const response = await api.post<{ success: boolean; data: Lead }>('/leads', payload)
  return response.data.data
}

export async function updateLead(id: string, payload: Partial<Lead>) {
  const response = await api.put<{ success: boolean; data: Lead }>(`/leads/${id}`, payload)
  return response.data.data
}

export async function updateLeadStage(id: string, stage: string) {
  const response = await api.patch<{ success: boolean; data: Lead }>(`/leads/${id}/stage`, { stage })
  return response.data.data
}
