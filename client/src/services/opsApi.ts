import api, { unwrap } from './api'
import type { MaintenanceRequest, AuditCycle, AuditAssignment, Paginated } from '@/types'

// ----- Maintenance -----
export async function listMaintenance(filters: { status?: string; priority?: string } = {}) {
  const res = await api.get('/maintenance', { params: filters })
  return unwrap<{ items: MaintenanceRequest[] }>(res).items
}

export async function reportMaintenance(input: { assetId: string; description: string; scheduledDate?: string }) {
  const res = await api.post('/maintenance', input)
  return unwrap<MaintenanceRequest>(res)
}

export async function updateMaintenance(
  id: string,
  input: Partial<{ status: MaintenanceRequest['status']; cost: number; scheduledDate: string; completedDate: string; description: string }>
) {
  const res = await api.patch(`/maintenance/${id}`, input)
  return unwrap<MaintenanceRequest>(res)
}

// ----- Audits -----
export async function listAuditCycles() {
  const res = await api.get('/audits/cycles')
  return unwrap<{ items: AuditCycle[] }>(res).items
}

export async function createAuditCycle(input: { scopeDeptId?: string; startDate: string; endDate: string }) {
  const res = await api.post('/audits/cycles', input)
  return unwrap<AuditCycle>(res)
}

export async function assignAudits(cycleId: string, assignments: { assetId: string; assignedToId: string }[]) {
  const res = await api.post(`/audits/cycles/${cycleId}/assignments`, { assignments })
  return unwrap<AuditAssignment[]>(res)
}

export async function listMyAudits() {
  const res = await api.get('/audits/my')
  return unwrap<{ items: AuditAssignment[] }>(res).items
}

export async function submitAuditResult(assignmentId: string, status: 'VERIFIED' | 'MISSING' | 'DAMAGED', notes?: string) {
  const res = await api.put(`/audits/assignments/${assignmentId}`, { status, notes })
  return unwrap<AuditAssignment>(res)
}

export type { Paginated }
