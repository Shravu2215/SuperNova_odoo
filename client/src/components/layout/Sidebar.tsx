import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  Building2,
  BarChart3,
  Bell,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles: Role[] // who is allowed to even see this in the nav
}

const ALL_ROLES: Role[] = ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']

// Single source of truth for nav visibility. App.tsx wraps the matching
// routes in the same RoleGuard roles, so a hidden item can never be reached
// by typing the URL directly either.
const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
  { to: '/assets', label: 'Assets', icon: Boxes, roles: ALL_ROLES },
  {
    to: '/allocations',
    label: 'Allocations',
    icon: ArrowLeftRight,
    roles: ALL_ROLES,
  },
  { to: '/bookings', label: 'Bookings', icon: CalendarClock, roles: ALL_ROLES },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ALL_ROLES },
  { to: '/audits', label: 'Audits', icon: ClipboardCheck, roles: ['ADMIN', 'ASSET_MANAGER'] },
  { to: '/organization', label: 'Organization', icon: Building2, roles: ['ADMIN'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ALL_ROLES },
]

export function Sidebar() {
  const { user } = useAuth()
  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-cream border-r border-black/5 h-screen sticky top-0 py-6 px-3">
      <div className="px-3 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-ink flex items-center justify-center text-cream font-bold text-sm">
          AF
        </div>
        <span className="text-lg font-bold text-ink">AssetFlow</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'bg-ink text-cream' : 'text-ink/60 hover:bg-black/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="mt-auto px-3 pt-4 text-[11px] text-ink/40">
          Signed in as <span className="font-medium text-ink/60">{user.role.replace('_', ' ')}</span>
        </div>
      )}
    </aside>
  )
}
