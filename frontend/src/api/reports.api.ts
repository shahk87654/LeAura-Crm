import api from './axios'

interface DateRange {
  startDate?: string
  endDate?: string
}

export async function getSummaryReport(params: DateRange) {
  const response = await api.get('/reports/summary', { params })
  return response.data.data
}

export async function getRevenueReport(params: DateRange) {
  const response = await api.get('/reports/revenue', { params })
  return response.data.data
}

export async function getLeadReport(params: DateRange) {
  const response = await api.get('/reports/leads', { params })
  return response.data.data
}

export async function getManagerReport(params: DateRange) {
  const response = await api.get('/reports/manager', { params })
  return response.data.data
}

export async function getVenueReport(params: DateRange) {
  const response = await api.get('/reports/venue', { params })
  return response.data.data
}
