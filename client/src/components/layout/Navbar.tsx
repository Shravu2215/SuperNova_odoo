import { useAuth } from '@/context/AuthContext'
import { useLiveStore } from '@/store/useLiveStore'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'Asset Manager',
  DEPARTMENT_HEAD: 'Department Head',
  EMPLOYEE: 'Employee',
}

export function Navbar() {
  const { user, logout } = useAuth()
  const connected = useLiveStore((s) => s.connected)

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-cream border-b border-black/5">
      <div>
        <h1 className="text-lg font-semibold text-ink">Good Morning, {user?.name ?? 'there'}</h1>
        <p className="text-xs text-ink/40">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs text-ink/50">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-success' : 'bg-gray-300'}`} />
          {connected ? 'Live' : 'Offline'}
        </span>
        {user && (
          <span className="hidden sm:inline text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {ROLE_LABEL[user.role]}
          </span>
        )}
        <NotificationBell />
        <button
          onClick={logout}
          className="text-sm text-ink/50 hover:text-danger transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
