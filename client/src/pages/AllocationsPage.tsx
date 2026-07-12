import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import toast from 'react-hot-toast'
import {
  listAllocations,
  listMyAllocations,
  listAssets,
  allocateAsset,
  approveAllocation,
  returnAsset,
  requestTransfer,
} from '@/services/assetsApi'
import { listEmployees } from '@/services/orgApi'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'
import { canSeeOrgWide } from '@/utils/scope'
import type { Allocation } from '@/types'

export function AllocationsPage() {
  const { user } = useAuth()
  const orgWide = canSeeOrgWide(user)
  const showAllAllocations = orgWide || user?.role === 'DEPARTMENT_HEAD'
  const [showAllocate, setShowAllocate] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [transferTarget, setTransferTarget] = useState<Allocation | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['allocations', showAllAllocations],
    queryFn: () => (showAllAllocations ? listAllocations() : listMyAllocations()),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveAllocation(id),
    onSuccess: () => {
      toast.success('Allocation approved')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Approval failed')
    }
  })

  const returnMutation = useMutation({
    mutationFn: (id: string) => returnAsset(id),
    onSuccess: () => {
      toast.success('Asset marked as returned')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
    },
  })

  const allocations = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Asset Allocation & Requests</h2>
        {orgWide ? (
          <button
            onClick={() => setShowAllocate(true)}
            className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
          >
            + Allocate Asset
          </button>
        ) : user?.role === 'EMPLOYEE' ? (
          <button
            onClick={() => setShowRequest(true)}
            className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
          >
            + Request Asset
          </button>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Asset Tag</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Held By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expected Return</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            )}
            {!isLoading &&
              allocations.map((a) => {
                const overdue = a.expectedReturnDate && a.status === 'ALLOCATED' && new Date(a.expectedReturnDate) < new Date()
                return (
                  <tr key={a.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 font-medium">{a.asset?.assetTag}</td>
                    <td className="px-4 py-3 text-gray-500">{a.asset?.description ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{a.allocatedToEmployee?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className={`px-4 py-3 ${overdue ? 'text-danger font-medium' : 'text-gray-500'}`}>
                      {a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : '—'}
                      {overdue && ' (overdue)'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      {showAllAllocations && (a.status === 'PENDING_APPROVAL' || a.status === 'TRANSFER_REQUESTED') && (
                        <button
                          onClick={() => approveMutation.mutate(a.id)}
                          className="text-primary text-sm hover:underline font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {a.status === 'ALLOCATED' && (a.allocatedToEmployeeId === user?.id || orgWide) && (
                        <>
                          <button onClick={() => setTransferTarget(a)} className="text-primary text-sm hover:underline">
                            Transfer
                          </button>
                          <button
                            onClick={() => returnMutation.mutate(a.id)}
                            className="text-gray-500 text-sm hover:underline"
                          >
                            Return
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            {!isLoading && allocations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No allocations to show
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAllocate && <AllocateModal onClose={() => setShowAllocate(false)} />}
      {showRequest && <RequestAssetModal onClose={() => setShowRequest(false)} />}
      {transferTarget && <TransferModal allocation={transferTarget} onClose={() => setTransferTarget(null)} />}
    </div>
  )
}

function useEmployeeOptions() {
  return useQuery({ queryKey: ['employees'], queryFn: () => listEmployees(), retry: false })
}

function RequestAssetModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: availableAssets } = useQuery({
    queryKey: ['assets', 'available-for-allocation'],
    queryFn: () => listAssets({ status: 'AVAILABLE', limit: 100 }).then(r => ({
      items: r.items.filter(a => !a.isShareable)
    })),
  })
  const [assetId, setAssetId] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      allocateAsset({
        assetId,
        allocatedToEmployeeId: user?.id,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success('Asset request submitted for approval')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Request failed')
    }
  })

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold">Request Asset</Dialog.Title>
          <p className="text-xs text-gray-500">Submit a request to allocate an available company asset to you.</p>

          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select an available asset</option>
              {availableAssets?.items.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.description ?? a.category?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expected Return Date</label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={!assetId || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
            >
              {mutation.isPending ? 'Requesting…' : 'Submit Request'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

function AllocateModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: availableAssets } = useQuery({
    queryKey: ['assets', 'available-for-allocation'],
    queryFn: () => listAssets({ status: 'AVAILABLE', limit: 100 }),
  })
  const { data: employees } = useEmployeeOptions()
  const [assetId, setAssetId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      allocateAsset({
        assetId,
        allocatedToEmployeeId: employeeId,
        expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success('Allocation processed')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      onClose()
    },
  })

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold">Allocate Asset</Dialog.Title>

          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select an available asset</option>
              {availableAssets?.items.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.description ?? a.category?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            {employees ? (
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Employee ID"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expected Return Date</label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={!assetId || !employeeId || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
            >
              {mutation.isPending ? 'Saving…' : 'Allocate'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

function TransferModal({ allocation, onClose }: { allocation: Allocation; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: employees } = useEmployeeOptions()
  const [employeeId, setEmployeeId] = useState('')

  const mutation = useMutation({
    mutationFn: () => requestTransfer(allocation.id, employeeId),
    onSuccess: () => {
      toast.success('Transfer requested')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      onClose()
    },
  })

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold">Transfer {allocation.asset?.assetTag}</Dialog.Title>
          <p className="text-sm text-gray-400">Currently held by {allocation.allocatedToEmployee?.name ?? '—'}</p>

          <div>
            <label className="block text-sm font-medium mb-1">New Employee</label>
            {employees ? (
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Employee ID"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={!employeeId || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg bg-danger text-white disabled:opacity-40"
            >
              {mutation.isPending ? 'Requesting…' : 'Request Transfer'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
