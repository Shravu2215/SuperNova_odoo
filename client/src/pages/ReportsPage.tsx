import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAssetReport, getAuditReport, downloadAssetReportCsv, downloadAuditReportCsv } from '@/services/miscApi'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { StatusBadge } from '@/components/common/StatusBadge'

const TABS = ['Assets', 'Audits'] as const

export function ReportsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Assets')

  const { data: assetReport, isLoading: loadingAssets } = useQuery({
    queryKey: ['reports', 'assets'],
    queryFn: () => getAssetReport(),
    enabled: tab === 'Assets',
  })

  const { data: auditReport, isLoading: loadingAudits } = useQuery({
    queryKey: ['reports', 'audits'],
    queryFn: () => getAuditReport(),
    enabled: tab === 'Audits',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reports & Analytics</h2>
        <button
          onClick={() => (tab === 'Assets' ? downloadAssetReportCsv() : downloadAuditReportCsv())}
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
        >
          Download CSV
        </button>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 w-fit shadow-card">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Assets' && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {loadingAssets ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Asset Tag</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Acquired Cost</th>
                </tr>
              </thead>
              <tbody>
                {assetReport?.map((a: any) => (
                  <tr key={a.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 font-medium">{a.assetTag}</td>
                    <td className="px-4 py-3 text-gray-500">{a.category?.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.location ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{a.acquiredCost != null ? `₹${a.acquiredCost}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'Audits' && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {loadingAudits ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Asset Tag</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {auditReport?.map((a: any) => (
                  <tr key={a.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 font-medium">{a.asset?.assetTag}</td>
                    <td className="px-4 py-3 text-gray-500">{a.assignedTo?.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
