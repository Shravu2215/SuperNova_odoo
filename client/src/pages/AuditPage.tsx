import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import toast from 'react-hot-toast'
import { listAuditCycles, createAuditCycle, assignAudits, listMyAudits, submitAuditResult } from '@/services/opsApi'
import { listAssets } from '@/services/assetsApi'
import { listEmployees } from '@/services/orgApi'
import { useAuth } from '@/context/AuthContext'
import { canSeeOrgWide } from '@/utils/scope'

export function AuditPage() {
  const { user } = useAuth()
  const orgWide = canSeeOrgWide(user)
  const [showNewCycle, setShowNewCycle] = useState(false)
  const [assignTarget, setAssignTarget] = useState<string | null>(null)

  const { data: cycles } = useQuery({ queryKey: ['audit-cycles'], queryFn: listAuditCycles, enabled: orgWide })
  const { data: myAudits } = useQuery({ queryKey: ['my-audits'], queryFn: listMyAudits })
  const queryClient = useQueryClient()

  const submitMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'VERIFIED' | 'MISSING' | 'DAMAGED' }) => submitAuditResult(id, status),
    onSuccess: () => {
      toast.success('Audit result submitted')
      queryClient.invalidateQueries({ queryKey: ['my-audits'] })
      queryClient.invalidateQueries({ queryKey: ['audit-cycles'] })
    },
  })

  return (
    <div className="space-y-6">
      {orgWide && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Audit Cycles</h2>
            <button onClick={() => setShowNewCycle(true)} className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
              + New Audit Cycle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cycles?.map((c) => {
              const total = c.assignments?.length ?? 0
              const done = c.assignments?.filter((a) => a.status !== 'PENDING').length ?? 0
              const progress = total === 0 ? 0 : Math.round((done / total) * 100)
              return (
                <div key={c.id} className="bg-white rounded-2xl shadow-card p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {c.scopeDeptId ? `Scoped to dept ${c.scopeDeptId}` : 'Organization-wide'} · {c.status}
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {progress}% resolved · {total} asset{total === 1 ? '' : 's'} assigned
                    </p>
                    <button onClick={() => setAssignTarget(c.id)} className="text-xs text-primary hover:underline">
                      Assign Assets
                    </button>
                  </div>
                </div>
              )
            })}
            {cycles?.length === 0 && <p className="text-sm text-gray-400">No audit cycles yet.</p>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">My Audit Assignments</h2>
        <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
          {myAudits?.length === 0 && <p className="p-4 text-sm text-gray-400">No pending audit assignments.</p>}
          {myAudits?.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{a.asset?.assetTag}</p>
                <p className="text-xs text-gray-400">{a.asset?.description ?? a.asset?.category?.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => submitMutation.mutate({ id: a.id, status: 'VERIFIED' })}
                  className="text-xs px-2 py-1 rounded-full bg-success/10 text-success hover:opacity-80"
                >
                  Verified
                </button>
                <button
                  onClick={() => submitMutation.mutate({ id: a.id, status: 'MISSING' })}
                  className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning hover:opacity-80"
                >
                  Missing
                </button>
                <button
                  onClick={() => submitMutation.mutate({ id: a.id, status: 'DAMAGED' })}
                  className="text-xs px-2 py-1 rounded-full bg-danger/10 text-danger hover:opacity-80"
                >
                  Damaged
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNewCycle && <NewCycleModal onClose={() => setShowNewCycle(false)} />}
      {assignTarget && <AssignModal cycleId={assignTarget} onClose={() => setAssignTarget(null)} />}
    </div>
  )
}

function NewCycleModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createAuditCycle({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      }),
    onSuccess: () => {
      toast.success('Audit cycle created')
      queryClient.invalidateQueries({ queryKey: ['audit-cycles'] })
      onClose()
    },
  })

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold">New Audit Cycle</Dialog.Title>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={!startDate || !endDate || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
            >
              {mutation.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

function AssignModal({ cycleId, onClose }: { cycleId: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: assets } = useQuery({ queryKey: ['assets', 'for-audit'], queryFn: () => listAssets({ limit: 100 }) })
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => listEmployees(), retry: false })
  const [assetId, setAssetId] = useState('')
  const [assignedToId, setAssignedToId] = useState('')

  const mutation = useMutation({
    mutationFn: () => assignAudits(cycleId, [{ assetId, assignedToId }]),
    onSuccess: () => {
      toast.success('Asset assigned for audit')
      queryClient.invalidateQueries({ queryKey: ['audit-cycles'] })
      onClose()
    },
  })

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold">Assign Asset for Audit</Dialog.Title>

          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select asset</option>
              {assets?.items.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Auditor</label>
            {employees ? (
              <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            ) : (
              <input value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} placeholder="Employee ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={!assetId || !assignedToId || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
            >
              {mutation.isPending ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
