import { AlertTriangle } from 'lucide-react'
import { useLiveStore } from '@/store/useLiveStore'

export function OverdueAlert() {
  const notifications = useLiveStore((s) => s.notifications)
  const overdue = notifications.filter((n) => n.type === 'OVERDUE_RETURN').slice(0, 5)

  if (overdue.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-4 text-sm text-gray-400">
        No overdue returns right now.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4">
      <div className="flex items-center gap-2 mb-3 text-danger">
        <AlertTriangle size={16} />
        <h3 className="font-semibold text-sm">Overdue Returns</h3>
      </div>
      <ul className="space-y-2">
        {overdue.map((n) => (
          <li key={n.id} className="text-sm text-gray-600 bg-danger/5 rounded-lg px-3 py-2">
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
