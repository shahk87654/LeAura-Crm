import api from './axios'
import { type User } from '../types'

interface LoginPayload {
  email: string
  password: string
}

interface AuthResponse {
  token: string
  user: User
}

export async function login(payload: LoginPayload) {
  const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', payload)
  return response.data.data
}

export async function fetchMe() {
  const response = await api.get<{ success: boolean; data: User }>('/auth/me')
  return response.data.data
}
