import { create } from 'zustand'
import toast from 'react-hot-toast'
import { realtimeEngine, type RealtimeEvent } from '@/services/realtime'
import { listMyNotifications, markNotificationRead } from '@/services/miscApi'
import { queryClient } from '@/queryClient'
import type { AppNotification, User } from '@/types'

interface LiveState {
  connected: boolean
  notifications: AppNotification[]
  unreadCount: number
  /** Starts the realtime feed for `user`: loads notification history, then subscribes to the socket. Returns a cleanup fn. */
  init: (user: User) => () => void
  markAllRead: () => void
}

export const useLiveStore = create<LiveState>((set, get) => ({
  connected: false,
  notifications: [],
  unreadCount: 0,

  init: () => {
    realtimeEngine.connect()
    set({ connected: realtimeEngine.isConnected() })

    listMyNotifications()
      .then((items) =>
        set({
          notifications: items,
          unreadCount: items.filter((n) => !n.isRead).length,
        })
      )
      .catch(() => {})

    const handle = (event: RealtimeEvent) => {
      switch (event.type) {
        case 'NOTIFICATION': {
          set((s) => ({
            notifications: [event.payload, ...s.notifications].slice(0, 50),
            unreadCount: s.unreadCount + 1,
          }))
          toast(event.payload.message, { icon: '🔔' })
          break
        }
        case 'ASSET_UPDATED': {
          queryClient.invalidateQueries({ queryKey: ['assets'] })
          queryClient.invalidateQueries({ queryKey: ['allocations'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
          break
        }
        case 'BOOKING_CHANGED': {
          queryClient.invalidateQueries({ queryKey: ['bookings'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
          break
        }
      }
    }

    const unsubscribe = realtimeEngine.subscribe(handle)
    const connectionPoll = setInterval(() => set({ connected: realtimeEngine.isConnected() }), 2000)

    return () => {
      unsubscribe()
      clearInterval(connectionPoll)
      realtimeEngine.disconnect()
      set({ connected: false })
    }
  },

  markAllRead: () => {
    const unread = get().notifications.filter((n) => !n.isRead)
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
    unread.forEach((n) => {
      markNotificationRead(n.id).catch(() => {})
    })
  },
}))
