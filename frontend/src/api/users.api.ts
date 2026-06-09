import api from './axios'
import { type User } from '../types'

export async function getUsers() {
  const response = await api.get<{ success: boolean; data: User[] }>('/users')
  return response.data.data
}

export async function createUser(payload: Partial<User> & { password: string }) {
  const response = await api.post<{ success: boolean; data: User }>('/users', payload)
  return response.data.data
}

export async function updateUser(id: string, payload: Partial<User> & { password?: string }) {
  const response = await api.put<{ success: boolean; data: User }>(`/users/${id}`, payload)
  return response.data.data
}

export async function deactivateUser(id: string) {
  const response = await api.delete<{ success: boolean; data: { id: string } }>(`/users/${id}`)
  return response.data.data
}
