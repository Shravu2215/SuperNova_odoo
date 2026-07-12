import { useEffect, useRef, useState } from 'react'
import type { DashboardMetrics } from '@/types'

function Card({ label, value }: { label: string; value: number }) {
  const [pulse, setPulse] = useState(false)
  const prev = useRef(value)

  useEffect(() => {
    if (prev.current !== value) {
      setPulse(true)
      prev.current = value
      const t = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div className={`bg-white rounded-3xl shadow-soft p-4 transition-shadow ${pulse ? 'ring-2 ring-primary/40' : ''}`}>
      <p className="text-xs text-ink/40 mb-2">{label}</p>
      <p className="text-2xl font-semibold text-ink">{value}</p>
    </div>
  )
}

export function KPICards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    { label: 'Assets Available', value: metrics.assets.available },
    { label: 'Assets Allocated', value: metrics.assets.allocated },
    { label: 'Under Maintenance', value: metrics.assets.maintenance },
    { label: 'Active Allocations', value: metrics.activities.activeAllocations },
    { label: 'Active Maintenance', value: metrics.activities.activeMaintenance },
    { label: 'Active Bookings', value: metrics.activities.activeBookings },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <Card key={c.label} label={c.label} value={c.value} />
      ))}
    </div>
  )
}
