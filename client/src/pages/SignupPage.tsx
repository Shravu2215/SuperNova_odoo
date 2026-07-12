import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { listDepartments } from '@/services/orgApi'
import toast from 'react-hot-toast'
import type { Role } from '@/types'

export function SignupPage() {
  const [searchParams] = useSearchParams()
  const roleParam = (searchParams.get('role') ?? 'EMPLOYEE') as Role

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [deptId, setDeptId] = useState('')
  const [role, setRole] = useState<Role>(roleParam)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signup(name, email, password, deptId, role)
      toast.success('Account created — welcome to AssetFlow!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <h2 className="text-2xl font-bold mb-1">Create your account</h2>
        <p className="text-sm text-gray-400 mb-6">
          Set up your profile to start requesting and managing assets
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            minLength={8}
            required
          />
          <p className="mt-1 text-xs text-gray-400">At least 8 characters, with an uppercase letter, a number, and a special character.</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Department</label>
          <select
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          >
            <option value="">Select department</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Requested Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="DEPARTMENT_HEAD">Department Head</option>
            <option value="ASSET_MANAGER">Asset Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 text-sm transition-opacity"
        >
          {loading ? 'Creating...' : 'Sign up'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
