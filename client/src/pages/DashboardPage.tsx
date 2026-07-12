import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KPICards } from '@/components/dashboard/KPICards'
import { OverdueAlert } from '@/components/dashboard/OverdueAlert'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { getDashboardMetrics } from '@/services/miscApi'
import { approveAllocation, updateBookingStatus } from '@/services/assetsApi'
import { useLiveStore } from '@/store/useLiveStore'
import { useAuth } from '@/context/AuthContext'
import { canSeeOrgWide } from '@/utils/scope'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/common/StatusBadge'

export function DashboardPage() {
  const notifications = useLiveStore((s) => s.notifications)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canSeeMetrics = user?.role !== 'EMPLOYEE'

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: getDashboardMetrics,
    enabled: canSeeMetrics,
  })

  const approveAllocMutation = useMutation({
    mutationFn: (id: string) => approveAllocation(id),
    onSuccess: () => {
      toast.success('Allocation approved')
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Approval failed')
    }
  })

  const approveBookingMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, 'UPCOMING'),
    onSuccess: () => {
      toast.success('Booking approved')
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Approval failed')
    }
  })

  const scopeLabel = canSeeOrgWide(user)
    ? 'Org-wide, live'
    : user?.role === 'DEPARTMENT_HEAD'
      ? `${user.department} department, live`
      : 'Just for you, live'

  return (
    <div className="space-y-6">
      {/* Premium personalized welcome banner */}
      <div className="bg-white rounded-3xl shadow-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-black/5">
        <div>
          <h2 className="text-2xl font-bold text-ink">Welcome back, {user?.name}!</h2>
          <p className="text-sm text-gray-500">
            Access portal: <span className="font-semibold text-primary">{user?.role.replace(/_/g, ' ')}</span> · {user?.department}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-cream border border-black/5 text-xs px-3.5 py-2 rounded-xl font-medium text-ink/70">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          Live Connection Sync
        </div>
      </div>

      <QuickActions />

      {canSeeMetrics ? (
        isLoading || !metrics ? (
          <LoadingSpinner />
        ) : (
          <>
            <KPICards metrics={metrics} />

            {/* Pending Approvals & Planning Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Approvals Queue */}
              <div className="bg-white rounded-3xl shadow-card p-6 space-y-4 border border-black/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-ink">Pending Booking Requests</h3>
                  <span className="text-xs bg-warning/10 text-warning px-2.5 py-0.5 rounded-full font-medium">
                    {metrics.pendingBookings?.length || 0} Awaiting
                  </span>
                </div>
                {(!metrics.pendingBookings || metrics.pendingBookings.length === 0) ? (
                  <p className="text-sm text-gray-400">No pending room or slot requests.</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {metrics.pendingBookings.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between border border-black/5 p-3 rounded-xl hover:bg-cream/40 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-ink">{b.resource?.assetTag} · {b.bookedByEmployee?.name}</p>
                          <p className="text-[11px] text-gray-500">
                            {new Date(b.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–
                            {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {b.notes && <p className="text-[10px] text-gray-400 italic">"{b.notes}"</p>}
                        </div>
                        <button
                          onClick={() => approveBookingMutation.mutate(b.id)}
                          className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Asset Allocation Approvals Queue */}
              <div className="bg-white rounded-3xl shadow-card p-6 space-y-4 border border-black/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-ink">Pending Asset Requests</h3>
                  <span className="text-xs bg-warning/10 text-warning px-2.5 py-0.5 rounded-full font-medium">
                    {metrics.pendingAllocations?.length || 0} Awaiting
                  </span>
                </div>
                {(!metrics.pendingAllocations || metrics.pendingAllocations.length === 0) ? (
                  <p className="text-sm text-gray-400">No pending asset requests.</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {metrics.pendingAllocations.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between border border-black/5 p-3 rounded-xl hover:bg-cream/40 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-ink">{a.asset?.assetTag} ({a.asset?.category?.name})</p>
                          <p className="text-[11px] text-gray-500">Requested by {a.allocatedToEmployee?.name}</p>
                          {a.expectedReturnDate && (
                            <p className="text-[10px] text-gray-400">Expected return: {new Date(a.expectedReturnDate).toLocaleDateString()}</p>
                          )}
                        </div>
                        <button
                          onClick={() => approveAllocMutation.mutate(a.id)}
                          className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inventory by Category & Hoarding Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Inventory counts */}
              <div className="bg-white rounded-3xl shadow-card p-6 space-y-4 border border-black/5">
                <h3 className="font-semibold text-sm text-ink">Asset Inventory Levels</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-cream text-gray-500">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">Category</th>
                        <th className="p-2.5">Available</th>
                        <th className="p-2.5">Allocated</th>
                        <th className="p-2.5">Reserved</th>
                        <th className="p-2.5 rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.inventoryByCategory?.map((cat: any) => (
                        <tr key={cat.categoryId} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="p-2.5 font-medium text-ink">{cat.categoryName}</td>
                          <td className="p-2.5 text-success font-semibold">{cat.available}</td>
                          <td className="p-2.5 text-primary">{cat.allocated}</td>
                          <td className="p-2.5 text-warning">{cat.reserved}</td>
                          <td className="p-2.5 text-gray-500 font-semibold">{cat.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hoarding Alerts Monitor */}
              <div className="bg-white rounded-3xl shadow-card p-6 space-y-4 border border-black/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-ink">Hoarding & Over-allocation Monitor</h3>
                  {user?.role === 'ADMIN' && (
                    <span className="text-[10px] text-danger bg-danger/5 border border-danger/10 px-2 py-0.5 rounded-full font-bold">
                      Admin Scan
                    </span>
                  )}
                </div>
                {(!metrics.hoardingAlerts || metrics.hoardingAlerts.length === 0) ? (
                  <p className="text-sm text-gray-400">All employees are holding acceptable resource amounts (≤1 asset).</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-cream text-danger">
                        <tr>
                          <th className="p-2.5 rounded-l-lg">Employee</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5 rounded-r-lg">Assets Held</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.hoardingAlerts.map((h: any) => (
                          <tr key={h.employeeId} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="p-2.5">
                              <p className="font-medium text-ink">{h.name}</p>
                              <p className="text-[10px] text-gray-400">{h.email}</p>
                            </td>
                            <td className="p-2.5 text-gray-500">{h.department}</td>
                            <td className="p-2.5 text-danger font-bold text-center sm:text-left pl-6">{h.allocatedCount} assets</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )
      ) : (
        <div className="bg-white rounded-3xl shadow-card p-6 text-sm text-gray-500 border border-black/5">
          <p className="font-semibold text-ink mb-1">Employee Dashboard View</p>
          Org-wide metrics and approvals are visible to Admins, Asset Managers, and Department Heads. Check the sidebar for Allocations, Bookings, and Notifications to manage your assets and meeting room slots.
        </div>
      )}

      {/* Recent Live Feed Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverdueAlert />

        <div className="bg-white rounded-3xl shadow-card p-6 border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-ink">Recent Activity</h3>
            <span className="text-[11px] text-ink/40 bg-cream px-2 py-0.5 rounded-full font-medium">{scopeLabel}</span>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400">Waiting for live activity…</p>
          ) : (
            <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {notifications.slice(0, 8).map((n) => (
                <li key={n.id} className="flex justify-between text-xs border-b border-gray-50 pb-2.5">
                  <span className="text-gray-600 leading-relaxed">{n.message}</span>
                  <span className="text-gray-400 whitespace-nowrap ml-3 text-[10px]">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
