import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'
import type { Role } from '@/types'

interface RoleGuardProps {
  children: ReactNode
  requiredRoles: Role[]
  fallback?: ReactNode
}

export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !requiredRoles.includes(user.role)) {
    return (
      fallback ?? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center max-w-md mx-auto mt-12">
          <p className="text-danger font-semibold mb-1">Access Denied</p>
          <p className="text-sm text-gray-400">
            Your role ({user?.role.replace('_', ' ') ?? 'guest'}) doesn't have permission to view this page.
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}
