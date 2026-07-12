import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { listDepartments, createDepartment, listCategories, createCategory, listEmployees, updateEmployeeRole } from '@/services/orgApi'
import type { Role } from '@/types'

const TABS = ['Departments', 'Asset Categories', 'Employee Directory'] as const

export function OrganizationPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Departments')

  return (
    <RoleGuard requiredRoles={['ADMIN']}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Organization Setup</h2>

        <div className="flex gap-1 bg-white rounded-lg p-1 w-fit shadow-card">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Departments' && <DepartmentsTab />}
        {tab === 'Asset Categories' && <CategoriesTab />}
        {tab === 'Employee Directory' && <EmployeesTab />}
      </div>
    </RoleGuard>
  )
}

function DepartmentsTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['departments'], queryFn: listDepartments })
  const [name, setName] = useState('')

  const mutation = useMutation({
    mutationFn: () => createDepartment({ name }),
    onSuccess: () => {
      toast.success('Department created')
      setName('')
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New department name"
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <button
          disabled={!name || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ul className="divide-y divide-gray-50 text-sm">
          {data?.map((d) => (
            <li key={d.id} className="py-2 flex justify-between">
              <span>{d.name}</span>
              <span className="text-gray-400">{d.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CategoriesTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: listCategories })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: () => createCategory({ name, description: description || undefined }),
    onSuccess: () => {
      toast.success('Category created')
      setName('')
      setDescription('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <button
          disabled={!name || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ul className="divide-y divide-gray-50 text-sm">
          {data?.map((c) => (
            <li key={c.id} className="py-2 flex justify-between">
              <span>{c.name}</span>
              <span className="text-gray-400">{c.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const ROLES: Role[] = ['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN']

function EmployeesTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['employees'], queryFn: () => listEmployees() })

  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => updateEmployeeRole(id, role),
    onSuccess: () => {
      toast.success('Role updated')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {isLoading ? (
        <div className="p-6">
          <LoadingSpinner />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((e) => (
              <tr key={e.id} className="border-t border-gray-50">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-gray-500">{e.email}</td>
                <td className="px-4 py-3 text-gray-500">{e.status}</td>
                <td className="px-4 py-3">
                  <select
                    value={e.role}
                    onChange={(ev) => mutation.mutate({ id: e.id, role: ev.target.value as Role })}
                    className="px-2 py-1 border rounded-lg text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
