import api from './axios'
import { type PackageItem } from '../types'

export async function getPackages() {
  const response = await api.get<{ success: boolean; data: PackageItem[] }>('/packages')
  return response.data.data
}

export async function createPackage(payload: Partial<PackageItem>) {
  const response = await api.post<{ success: boolean; data: PackageItem }>('/packages', payload)
  return response.data.data
}

export async function updatePackage(id: string, payload: Partial<PackageItem>) {
  const response = await api.put<{ success: boolean; data: PackageItem }>(`/packages/${id}`, payload)
  return response.data.data
}

export async function deactivatePackage(id: string) {
  const response = await api.delete<{ success: boolean; data: { id: string } }>(`/packages/${id}`)
  return response.data.data
}
