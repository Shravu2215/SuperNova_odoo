import api, { unwrap } from './api'
import type { Department, AssetCategory, Employee, Role } from '@/types'

// ----- Departments -----
export async function listDepartments() {
  const res = await api.get('/departments')
  return unwrap<{ items: Department[] }>(res).items
}

export async function createDepartment(input: { name: string; parentDeptId?: string | null }) {
  const res = await api.post('/departments', input)
  return unwrap<Department>(res)
}

export async function updateDepartment(id: string, input: Partial<{ name: string; status: string }>) {
  const res = await api.patch(`/departments/${id}`, input)
  return unwrap<Department>(res)
}

// ----- Asset categories -----
export async function listCategories() {
  const res = await api.get('/categories')
  return unwrap<{ items: AssetCategory[] }>(res).items
}

export async function createCategory(input: { name: string; description?: string }) {
  const res = await api.post('/categories', input)
  return unwrap<AssetCategory>(res)
}

export async function updateCategory(id: string, input: Partial<{ name: string; description: string }>) {
  const res = await api.patch(`/categories/${id}`, input)
  return unwrap<AssetCategory>(res)
}

// ----- Employees (admin only) -----
export async function listEmployees(params?: { deptId?: string; role?: Role; status?: string }) {
  const res = await api.get('/employees', { params })
  return unwrap<{ items: Employee[] }>(res).items
}

export async function updateEmployeeRole(id: string, role: Role) {
  const res = await api.patch(`/employees/${id}/role`, { role })
  return unwrap<Employee>(res)
}
