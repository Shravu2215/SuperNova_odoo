// Keeps track of "who is logged in" for the whole app, backed by the real API.
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as authApi from '@/services/authApi'
import { listDepartments } from '@/services/orgApi'
import { getToken, clearToken } from '@/services/api'
import type { User, Role } from '@/types'

const USER_CACHE_KEY = 'assetflow_user'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, deptId: string, role?: Role) => Promise<void>
  logout: () => void
  hasRole: (roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function resolveDepartmentName(deptId: string): Promise<string> {
  try {
    const depts = await listDepartments()
    return depts.find((d) => d.id === deptId)?.name ?? deptId
  } catch {
    return deptId
  }
}

function toUser(profile: { id: string; name: string; email: string; role: Role; deptId: string }, departmentName: string): User {
  return { id: profile.id, name: profile.name, email: profile.email, role: profile.role, deptId: profile.deptId, department: departmentName }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On page load: if a token exists, verify it against the backend rather than
  // trusting the cached copy (it may have expired or the account may have changed).
  useEffect(() => {
    const cached = localStorage.getItem(USER_CACHE_KEY)
    if (cached) setUser(JSON.parse(cached))

    if (!getToken()) {
      setIsLoading(false)
      return
    }

    authApi
      .me()
      .then(async (profile) => {
        const department = await resolveDepartmentName(profile.deptId)
        const freshUser = toUser(profile, department)
        setUser(freshUser)
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(freshUser))
      })
      .catch(() => {
        clearToken()
        localStorage.removeItem(USER_CACHE_KEY)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const profile = await authApi.login(email, password)
    const department = await resolveDepartmentName(profile.deptId)
    const loggedInUser = toUser(profile, department)
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  async function signup(name: string, email: string, password: string, deptId: string, role?: Role) {
    const profile = await authApi.signup(name, email, password, deptId, role)
    const department = await resolveDepartmentName(profile.deptId)
    const signedUpUser = toUser(profile, department)
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(signedUpUser))
    setUser(signedUpUser)
  }

  function logout() {
    authApi.logout()
    localStorage.removeItem(USER_CACHE_KEY)
    setUser(null)
  }

  function hasRole(roles: Role[]) {
    return user ? roles.includes(user.role) : false
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
