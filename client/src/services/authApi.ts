import api, { unwrap, setToken, clearToken } from './api'
import type { Role } from '@/types'

interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  deptId: string
  createdAt: string
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password })
  const { accessToken, user } = unwrap<{ accessToken: string; user: AuthUser }>(res)
  setToken(accessToken)
  return user
}

export async function signup(name: string, email: string, password: string, deptId: string, role?: Role) {
  const res = await api.post('/auth/signup', { name, email, password, deptId, role })
  const { accessToken, user } = unwrap<{ accessToken: string; user: AuthUser }>(res)
  setToken(accessToken)
  return user
}

export async function me() {
  const res = await api.get('/auth/me')
  return unwrap<AuthUser>(res)
}

export async function logout() {
  clearToken()
  try {
    await api.post('/auth/logout')
  } catch {
    // best-effort — local session is already cleared
  }
}
