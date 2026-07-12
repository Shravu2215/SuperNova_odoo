import { formatDistanceToNow } from 'date-fns'
import { useLiveStore } from '@/store/useLiveStore'

export function NotificationsPage() {
  const { notifications, markAllRead } = useLiveStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button onClick={markAllRead} className="text-sm text-primary hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">
            Nothing yet — this list fills in live as events happen (asset assignments, booking
            confirmations, overdue alerts, audit discrepancies, etc).
          </p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`px-4 py-3 flex justify-between ${!n.isRead ? 'bg-primary/5' : ''}`}>
              <div>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400">{n.type.replace(/_/g, ' ')}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
