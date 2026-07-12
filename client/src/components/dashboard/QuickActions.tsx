import { useNavigate } from 'react-router-dom'
import { PackagePlus, CalendarPlus, Wrench, ArrowLeftRight, ClipboardCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

const ACTIONS: { label: string; icon: typeof PackagePlus; to: string; roles: Role[] }[] = [
  {
    label: 'Register Asset',
    icon: PackagePlus,
    to: '/assets?action=register',
    roles: ['ADMIN', 'ASSET_MANAGER'],
  },
  {
    label: 'Approve Transfers',
    icon: ArrowLeftRight,
    to: '/allocations',
    roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'],
  },
  { label: 'Book Resource', icon: CalendarPlus, to: '/bookings?action=new', roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
  {
    label: 'Raise Maintenance Request',
    icon: Wrench,
    to: '/maintenance?action=new',
    roles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
  },
  { label: 'Run Audit', icon: ClipboardCheck, to: '/audits', roles: ['ADMIN', 'ASSET_MANAGER'] },
]

export function QuickActions() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const actions = ACTIONS.filter((a) => user && a.roles.includes(user.role))

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map(({ label, icon: Icon, to }) => (
        <button
          key={label}
          onClick={() => navigate(to)}
          className="flex items-center gap-2 bg-white rounded-full shadow-soft px-4 py-2.5 text-sm font-medium text-ink/70 hover:text-primary hover:shadow-card transition-all"
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  )
}
