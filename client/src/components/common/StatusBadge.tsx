const COLOR_MAP: Record<string, string> = {
  AVAILABLE: 'bg-success/10 text-success',
  ALLOCATED: 'bg-primary/10 text-primary',
  RESERVED: 'bg-warning/10 text-warning',
  UNDER_MAINTENANCE: 'bg-warning/10 text-warning',
  LOST: 'bg-danger/10 text-danger',
  RETIRED: 'bg-gray-200 text-gray-600',
  DISPOSED: 'bg-gray-200 text-gray-600',
  UPCOMING: 'bg-primary/10 text-primary',
  ONGOING: 'bg-success/10 text-success',
  COMPLETED: 'bg-gray-200 text-gray-600',
  CANCELLED: 'bg-danger/10 text-danger',
  PENDING: 'bg-warning/10 text-warning',
  APPROVED: 'bg-success/10 text-success',
  REJECTED: 'bg-danger/10 text-danger',
  TECHNICIAN_ASSIGNED: 'bg-primary/10 text-primary',
  IN_PROGRESS: 'bg-warning/10 text-warning',
  RESOLVED: 'bg-success/10 text-success',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = COLOR_MAP[status] || 'bg-gray-200 text-gray-600'
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
