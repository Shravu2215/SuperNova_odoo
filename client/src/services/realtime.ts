import { io, type Socket } from 'socket.io-client'
import { getToken } from './api'
import type { AppNotification, AssetStatus } from '@/types'

export type RealtimeEvent =
  | { type: 'NOTIFICATION'; payload: AppNotification }
  | { type: 'ASSET_UPDATED'; payload: { assetId: string; status: AssetStatus } }
  | { type: 'BOOKING_CHANGED'; payload: unknown }

type Listener = (event: RealtimeEvent) => void

/**
 * Thin wrapper around the backend's Socket.IO server (see server/src/config/socket.ts).
 * Auth is a JWT access token sent in the handshake; the server puts each socket
 * in a room named after its userId, so `notification:new` only reaches its recipient
 * while asset/booking events are broadcast to everyone (clients just refetch).
 */
class RealtimeEngine {
  private socket: Socket | null = null
  private listeners = new Set<Listener>()
  private connected = false

  connect() {
    if (this.socket) return
    const url = import.meta.env.VITE_WS_URL as string

    this.socket = io(url, {
      auth: (cb) => cb({ token: getToken() }),
      withCredentials: true,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      this.connected = true
    })
    this.socket.on('disconnect', () => {
      this.connected = false
    })
    this.socket.on('connect_error', () => {
      this.connected = false
    })

    this.socket.on('notification:new', (payload: AppNotification) => this.emit({ type: 'NOTIFICATION', payload }))
    this.socket.on('asset:updated', (payload: { assetId: string; status: AssetStatus }) =>
      this.emit({ type: 'ASSET_UPDATED', payload })
    )
    this.socket.on('booking:created', (payload: unknown) => this.emit({ type: 'BOOKING_CHANGED', payload }))
    this.socket.on('booking:cancelled', (payload: unknown) => this.emit({ type: 'BOOKING_CHANGED', payload }))
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
    this.connected = false
  }

  isConnected() {
    return this.connected
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(event: RealtimeEvent) {
    this.listeners.forEach((l) => l(event))
  }
}

export const realtimeEngine = new RealtimeEngine()
