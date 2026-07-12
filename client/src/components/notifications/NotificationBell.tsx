import { Popover } from '@headlessui/react'
import { Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useLiveStore } from '@/store/useLiveStore'

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useLiveStore()

  return (
    <Popover className="relative">
      <Popover.Button
        onClick={() => unreadCount > 0 && markAllRead()}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={18} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Popover.Button>

      <Popover.Panel className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-card border border-gray-100 z-20 max-h-96 overflow-y-auto">
        <div className="p-3 border-b border-gray-100 font-semibold text-sm">Notifications</div>
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No notifications yet</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
              <p className="text-sm text-gray-700">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </Popover.Panel>
    </Popover>
  )
}
