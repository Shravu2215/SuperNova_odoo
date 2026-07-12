import api, { unwrap } from './api'
import type { AppNotification, DashboardMetrics } from '@/types'

// ----- Notifications -----
export async function listMyNotifications() {
  const res = await api.get('/notifications/my')
  return unwrap<{ items: AppNotification[] }>(res).items
}

export async function markNotificationRead(id: string) {
  const res = await api.patch(`/notifications/${id}/read`)
  return unwrap<unknown>(res)
}

// ----- Dashboard -----
export async function getDashboardMetrics() {
  const res = await api.get('/dashboard/metrics')
  return unwrap<DashboardMetrics>(res)
}

// ----- Reports -----
export async function getAssetReport(params: { status?: string; categoryId?: string } = {}) {
  const res = await api.get('/reports/assets', { params })
  return unwrap<{ items: any[] }>(res).items
}

export async function getAuditReport(params: { cycleId?: string } = {}) {
  const res = await api.get('/reports/audits', { params })
  return unwrap<{ items: any[] }>(res).items
}

async function downloadCsv(path: string, filename: string) {
  const res = await api.get(path, { params: { format: 'csv' }, responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const downloadAssetReportCsv = () => downloadCsv('/reports/assets', 'asset_report.csv')
export const downloadAuditReportCsv = () => downloadCsv('/reports/audits', 'audit_report.csv')
