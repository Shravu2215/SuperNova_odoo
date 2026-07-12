export type Role = 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  deptId: string
  /** Resolved department display name (falls back to deptId until departments load). */
  department: string
}

export interface Department {
  id: string
  name: string
  parentDeptId: string | null
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

export interface AssetCategory {
  id: string
  name: string
  description?: string | null
  customFields?: Record<string, unknown> | null
}

export type AssetStatus =
  | 'AVAILABLE'
  | 'ALLOCATED'
  | 'RESERVED'
  | 'UNDER_MAINTENANCE'
  | 'LOST'
  | 'RETIRED'
  | 'DISPOSED'

export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED'

export interface Asset {
  id: string
  assetTag: string
  serialNumber?: string | null
  categoryId: string
  category: AssetCategory
  status: AssetStatus
  condition: AssetCondition
  location?: string | null
  isShareable: boolean
  acquiredDate?: string | null
  acquiredCost?: number | null
  photoUrl?: string | null
  description?: string | null
  createdAt: string
  updatedAt: string
}

export type AllocationStatus = 'PENDING_APPROVAL' | 'ALLOCATED' | 'RETURNED' | 'TRANSFER_REQUESTED'

export interface Allocation {
  id: string
  assetId: string
  asset: Asset
  allocatedToEmployeeId?: string | null
  allocatedToEmployee?: { name: string; email: string } | null
  allocatedToDeptId?: string | null
  expectedReturnDate?: string | null
  actualReturnDate?: string | null
  status: AllocationStatus
  returnConditionNotes?: string | null
  createdAt: string
}

export type BookingStatus = 'PENDING_APPROVAL' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'

export interface Booking {
  id: string
  resourceId: string
  resource?: Asset
  bookedByEmployeeId: string
  bookedByEmployee?: { name: string; email: string }
  startTime: string
  endTime: string
  status: BookingStatus
  notes?: string | null
  createdAt: string
}

export type MaintenanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'RESOLVED'

export interface MaintenanceRequest {
  id: string
  assetId: string
  asset?: Asset
  raisedByEmployeeId: string
  raisedByEmployee?: { name: string; email: string }
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  photoUrl?: string | null
  status: MaintenanceStatus
  technician?: string | null
  resolutionNotes?: string | null
  createdAt: string
}

export type AuditCycleStatus = 'OPEN' | 'CLOSED'
export type AuditAssignmentStatus = 'PENDING' | 'VERIFIED' | 'MISSING' | 'DAMAGED'

export interface AuditCycle {
  id: string
  scopeDeptId?: string | null
  startDate: string
  endDate: string
  status: AuditCycleStatus
  assignments?: AuditAssignment[]
  createdAt: string
}

export interface AuditAssignment {
  id: string
  cycleId: string
  assetId: string
  asset?: Asset
  assignedToId: string
  assignedTo?: { name: string; email: string }
  status: AuditAssignmentStatus
  notes?: string | null
  completedAt?: string | null
  createdAt: string
}

export type NotificationType =
  | 'ASSET_ASSIGNED'
  | 'MAINTENANCE_APPROVED'
  | 'MAINTENANCE_REJECTED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'TRANSFER_APPROVED'
  | 'TRANSFER_REJECTED'
  | 'OVERDUE_RETURN'
  | 'AUDIT_DISCREPANCY'

export interface AppNotification {
  id: string
  type: NotificationType
  message: string
  metadata?: Record<string, unknown> | null
  isRead: boolean
  createdAt: string
}

export interface Employee {
  id: string
  name: string
  email: string
  role: Role
  deptId: string
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED'
  createdAt: string
}

export interface DashboardMetrics {
  assets: { total: number; available: number; allocated: number; maintenance: number }
  activities: { activeAllocations: number; activeMaintenance: number; activeBookings: number }
  hoardingAlerts?: any[]
  inventoryByCategory?: any[]
  pendingAllocations?: any[]
  pendingBookings?: any[]
}

export interface Paginated<T> {
  total: number
  page: number
  limit: number
  items: T[]
}
