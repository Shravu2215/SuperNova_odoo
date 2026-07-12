import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import toast from 'react-hot-toast'
import { listAssets, createAsset } from '@/services/assetsApi'
import { listCategories } from '@/services/orgApi'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/context/AuthContext'
import { canSeeOrgWide } from '@/utils/scope'
import { Search } from 'lucide-react'

export function AssetsPage() {
  const [query, setQuery] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const debounced = useDebounce(query, 250)
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['assets', debounced],
    queryFn: () => listAssets({ search: debounced || undefined, limit: 50 }),
  })

  const assets = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Asset Directory</h2>
          <p className="text-xs text-gray-400">{canSeeOrgWide(user) ? 'Org-wide view' : 'Assets & bookable resources'}</p>
        </div>
        {canSeeOrgWide(user) && (
          <button
            onClick={() => setShowRegister(true)}
            className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
          >
            + Register Asset
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by tag or serial number…"
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Asset Tag</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Shareable</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            )}
            {!isLoading &&
              assets.map((a) => (
                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{a.assetTag}</td>
                  <td className="px-4 py-3">{a.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{a.category?.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.condition}</td>
                  <td className="px-4 py-3 text-gray-500">{a.location ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{a.isShareable ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            {!isLoading && assets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No assets match your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRegister && <RegisterAssetModal onClose={() => setShowRegister(false)} />}
    </div>
  )
}

function RegisterAssetModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: listCategories })
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [location, setLocation] = useState('')
  const [isShareable, setIsShareable] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      createAsset({
        categoryId,
        description: description || undefined,
        serialNumber: serialNumber || undefined,
        location: location || undefined,
        isShareable,
      }),
    onSuccess: () => {
      toast.success('Asset registered')
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      onClose()
    },
  })

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-card p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold">Register Asset</Dialog.Title>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="e.g. MacBook Pro 14&quot;"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serial Number</label>
            <input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isShareable} onChange={(e) => setIsShareable(e.target.checked)} />
            Bookable / shared resource
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
            <button
              disabled={!categoryId || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
            >
              {mutation.isPending ? 'Saving…' : 'Register'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
