import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import toast from 'react-hot-toast'
import { listMaintenance, reportMaintenance, updateMaintenance } from '@/services/opsApi'
import { listAssets } from '@/services/assetsApi'
import { useAuth } from '@/context/AuthContext'
import { canSeeOrgWide } from '@/utils/scope'
import type { MaintenanceStatus } from '@/types'

const COLUMNS: MaintenanceStatus[] = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-warning/10 text-warning',
  HIGH: 'bg-danger/10 text-danger',
}

const NEXT_STATUS: Partial<Record<MaintenanceStatus, { label: string; next: MaintenanceStatus }[]>> = {
  PENDING: [
    { label: 'Approve', next: 'APPROVED' },
    { label: 'Reject', next: 'REJECTED' },
  ],
  APPROVED: [{ label: 'Start Work', next: 'IN_PROGRESS' }],
  IN_PROGRESS: [{ label: 'Resolve', next: 'RESOLVED' }],
}

export function MaintenancePage() {
  const { user } = useAuth()
  const orgWide = canSeeOrgWide(user)
  const [showRaise, setShowRaise] = useState(false)
  const queryClient = useQueryClient()

  const { data: requests } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => listMaintenance(),
    enabled: orgWide,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MaintenanceStatus }) => updateMaintenance(id, { status }),
    onSuccess: () => {
      toast.success('Request updated')
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{orgWide ? 'Maintenance Requests' : 'Report a Maintenance Issue'}</h2>
          {!orgWide && (
            <p className="text-xs text-gray-400">
              Request tracking is only visible to Admins and Asset Managers today — raise a request below and they'll follow up.
            </p>
          )}
        </div>
        <button onClick={() => setShowRaise(true)} className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
          + Raise Request
        </button>
      </div>

      {orgWide && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((col) => {
            const items = (requests ?? []).filter((m) => m.status === col)
            return (
              <div key={col} className="min-w-[240px] flex-1">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  {col.replace(/_/g, ' ')} ({items.length})
                </p>
                <div className="space-y-3">
                  {items.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl shadow-card p-3 space-y-2">
                      <p className="font-medium text-sm">{m.asset?.assetTag ?? m.assetId}</p>
                      <p className="text-xs text-gray-500">{m.description}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${PRIORITY_COLOR[m.priority]}`}>
                        {m.priority}
                      </span>
                      <div className="flex gap-2 pt-1">
                        {(NEXT_STATUS[m.status] ?? []).map((action) => (
                          <button
                            key={action.next}
                            onClick={() => statusMutation.mutate({ id: m.id, status: action.next })}
                            className="text-xs text-primary hover:underline"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-xs text-gray-300 italic">No items</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showRaise && <RaiseRequestModal onClose={() => setShowRaise(false)} />}
    </div>
  )
}

function RaiseRequestModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: assets } = useQuery({ queryKey: ['assets', 'for-maintenance'], queryFn: () => listAssets({ limit: 100 }) })
  const [assetId, setAssetId] = useState('')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: () => reportMaintenance({ assetId, description }),
    onSuccess: () => {
      toast.success('Maintenance request submitted')
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      onClose()
    },
  })

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold">Raise Maintenance Request</Dialog.Title>

          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select asset</option>
              {assets?.items.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.description ?? a.category?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="What's wrong with it?"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={!assetId || !description || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
            >
              {mutation.isPending ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
