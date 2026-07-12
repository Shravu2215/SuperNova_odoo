import api, { unwrap } from './api'
import type { Asset, Allocation, Booking, Paginated, BookingStatus } from '@/types'

// ----- Assets -----
export interface AssetFilters {
  status?: string
  categoryId?: string
  location?: string
  search?: string
  page?: number
  limit?: number
}

export async function listAssets(filters: AssetFilters = {}) {
  const res = await api.get('/assets', { params: filters })
  return unwrap<Paginated<Asset>>(res)
}

export async function getAsset(id: string) {
  const res = await api.get(`/assets/${id}`)
  return unwrap<{ asset: Asset; history: unknown[] }>(res)
}

export interface CreateAssetInput {
  categoryId: string
  serialNumber?: string
  condition?: Asset['condition']
  location?: string
  isShareable?: boolean
  acquiredDate?: string
  acquiredCost?: number
  description?: string
}

export async function createAsset(input: CreateAssetInput) {
  const res = await api.post('/assets', input)
  return unwrap<Asset>(res)
}

export async function updateAsset(id: string, input: Partial<CreateAssetInput>) {
  const res = await api.patch(`/assets/${id}`, input)
  return unwrap<Asset>(res)
}

// ----- Allocations -----
export async function listAllocations(filters: { status?: string } = {}) {
  const res = await api.get('/allocations', { params: filters })
  return unwrap<Paginated<Allocation>>(res)
}

export async function listMyAllocations(filters: { status?: string } = {}) {
  const res = await api.get('/allocations/my', { params: filters })
  return unwrap<Paginated<Allocation>>(res)
}

export async function allocateAsset(input: {
  assetId: string
  allocatedToEmployeeId?: string
  allocatedToDeptId?: string
  expectedReturnDate?: string
}) {
  const res = await api.post('/allocations', input)
  return unwrap<Allocation>(res)
}

export async function requestTransfer(allocationId: string, newEmployeeId: string) {
  const res = await api.post(`/allocations/${allocationId}/transfer`, { newEmployeeId })
  return unwrap<Allocation>(res)
}

export async function approveAllocation(allocationId: string) {
  const res = await api.put(`/allocations/${allocationId}/approve`)
  return unwrap<Allocation>(res)
}

export async function returnAsset(allocationId: string, input: { actualReturnDate?: string; returnConditionNotes?: string } = {}) {
  const res = await api.put(`/allocations/${allocationId}/return`, input)
  return unwrap<Allocation>(res)
}

// ----- Bookings -----
export async function listBookings() {
  const res = await api.get('/bookings')
  return unwrap<Paginated<Booking>>(res)
}

export async function listMyBookings() {
  const res = await api.get('/bookings/my')
  return unwrap<Paginated<Booking>>(res)
}

export async function createBooking(input: { assetId: string; startTime: string; endTime: string; purpose?: string }) {
  const res = await api.post('/bookings', input)
  return unwrap<Booking>(res)
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const res = await api.patch(`/bookings/${id}/status`, { status })
  return unwrap<Booking>(res)
}
