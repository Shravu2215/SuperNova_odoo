import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { listAssets, listBookings, listMyBookings, createBooking, updateBookingStatus } from '@/services/assetsApi'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import { canSeeOrgWide } from '@/utils/scope'

function toLocalIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function BookingsPage() {
  const { user } = useAuth()
  const orgWide = canSeeOrgWide(user)
  const showAllBookings = orgWide || user?.role === 'DEPARTMENT_HEAD'
  const queryClient = useQueryClient()

  const { data: resources } = useQuery({
    queryKey: ['assets', 'shareable'],
    queryFn: () => listAssets({ limit: 100 }).then((r: any) => r.items.filter((a: any) => a.isShareable)),
  })

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', showAllBookings],
    queryFn: () => (showAllBookings ? listBookings() : listMyBookings()),
  })

  const [resourceId, setResourceId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('11:00')
  const [purpose, setPurpose] = useState('')

  const bookings = bookingsData?.items ?? []
  const resourceBookings = useMemo(
    () => bookings.filter((b: any) => b.resourceId === resourceId && b.status !== 'CANCELLED' && b.status !== 'REJECTED' && b.status !== 'COMPLETED'),
    [bookings, resourceId]
  )

  const conflicts = useMemo(() => {
    if (!resourceId) return []
    const s = toLocalIso(date, start)
    const e = toLocalIso(date, end)
    if (new Date(e) <= new Date(s)) return []
    return resourceBookings.filter((b: any) => new Date(s) < new Date(b.endTime) && new Date(b.startTime) < new Date(e))
  }, [resourceBookings, date, start, end, resourceId])

  const validRange = toLocalIso(date, end) > toLocalIso(date, start)
  const isAvailable = resourceId !== '' && conflicts.length === 0 && validRange

  const createMutation = useMutation({
    mutationFn: () =>
      createBooking({
        assetId: resourceId,
        startTime: toLocalIso(date, start),
        endTime: toLocalIso(date, end),
        purpose: purpose || undefined,
      }),
    onSuccess: () => {
      toast.success('Booking request submitted for approval')
      setPurpose('')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, 'CANCELLED'),
    onSuccess: () => {
      toast.success('Booking cancelled')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const approveBookingMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, 'UPCOMING'),
    onSuccess: () => {
      toast.success('Booking approved')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Approval failed')
    }
  })

  const rejectBookingMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, 'REJECTED'),
    onSuccess: () => {
      toast.success('Booking rejected')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Rejection failed')
    }
  })

  const selectedResource = resources?.find((r: any) => r.id === resourceId)

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold">Resource Booking</h2>

      <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Resource (Conference / Meeting Room)</label>
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Select a bookable resource</option>
            {resources?.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.assetTag} — {r.description ?? r.category?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Purpose (optional)</label>
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        {conflicts.length > 0 && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg p-3 text-sm text-danger">
            <p className="font-medium mb-1">Time slot conflicts with existing booking(s):</p>
            {conflicts.map((c: any) => (
              <p key={c.id}>
                {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–
                {new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (booked by {c.bookedByEmployee?.name})
              </p>
            ))}
          </div>
        )}

        {!validRange && <p className="text-sm text-warning">End time must be after start time.</p>}

        <button
          disabled={!isAvailable || createMutation.isPending}
          onClick={() => createMutation.mutate()}
          className="w-full bg-success text-white py-2 rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        >
          {createMutation.isPending ? 'Requesting…' : isAvailable ? 'Request Time Slot' : 'Unavailable'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5">
        <h3 className="font-semibold text-sm mb-3">
          {showAllBookings ? 'All' : 'My'} Bookings {selectedResource ? `for ${selectedResource.assetTag}` : ''}
        </h3>
        {isLoading && <LoadingSpinner />}
        {!isLoading && resourceBookings.length === 0 && (
          <p className="text-sm text-gray-400">{resourceId ? 'No active bookings for this resource.' : 'Select a resource to see its bookings.'}</p>
        )}
        <ul className="space-y-3">
          {resourceBookings.map((b: any) => (
            <li key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-b border-gray-50 pb-2">
              <span className="mb-2 sm:mb-0">
                <span className="font-medium">
                  {new Date(b.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}–
                  {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-gray-400 ml-1">· booked by {b.bookedByEmployee?.name}</span>
                {b.notes && <p className="text-xs text-gray-500 italic mt-0.5">Purpose: "{b.notes}"</p>}
              </span>
              <span className="flex items-center gap-3">
                <StatusBadge status={b.status} />

                {b.status === 'PENDING_APPROVAL' && (user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER' || user?.role === 'DEPARTMENT_HEAD') && (
                  <span className="flex gap-2">
                    <button onClick={() => approveBookingMutation.mutate(b.id)} className="text-success text-xs font-semibold hover:underline">
                      Approve
                    </button>
                    <button onClick={() => rejectBookingMutation.mutate(b.id)} className="text-danger text-xs font-semibold hover:underline">
                      Reject
                    </button>
                  </span>
                )}

                {(b.bookedByEmployeeId === user?.id || user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && b.status !== 'CANCELLED' && b.status !== 'REJECTED' && (
                  <button onClick={() => cancelMutation.mutate(b.id)} className="text-gray-400 text-xs hover:underline">
                    Cancel
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
