import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { User, Briefcase, Shield, Settings, ArrowLeft } from 'lucide-react'

// Matches server/prisma/seed.ts — these accounts exist in the seeded database.
const DEMO_LOGINS = [
  { role: 'ADMIN', label: 'Admin', email: 'admin@assetflow.com', password: 'Admin123!' },
  { role: 'ASSET_MANAGER', label: 'Asset Manager', email: 'john.manager@assetflow.com', password: 'User123!' },
  { role: 'DEPARTMENT_HEAD', label: 'Department Head', email: 'sarah.head@assetflow.com', password: 'User123!' },
  { role: 'EMPLOYEE', label: 'Employee', email: 'alice.employee@assetflow.com', password: 'User123!' },
]

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSelectRole(role: string) {
    setSelectedRole(role)
    const demo = DEMO_LOGINS.find((d) => d.role === role)
    if (demo) {
      setEmail(demo.email)
      setPassword(demo.password)
    } else {
      setEmail('')
      setPassword('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-card p-8 md:p-12 text-center space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">Welcome to AssetFlow</h1>
            <p className="text-sm text-gray-500">Choose your role portal below to proceed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                role: 'EMPLOYEE',
                label: 'Employee',
                icon: User,
                desc: 'Request assets, book conference rooms/meeting slots, and track returns',
                color: 'hover:border-primary hover:bg-primary/5 text-primary',
              },
              {
                role: 'DEPARTMENT_HEAD',
                label: 'Department Head',
                icon: Briefcase,
                desc: 'Approve asset requests and resource bookings for your department',
                color: 'hover:border-warning hover:bg-warning/5 text-warning',
              },
              {
                role: 'ASSET_MANAGER',
                label: 'Asset Manager',
                icon: Shield,
                desc: 'Manage all resources, check inventory counts, and plan future assets',
                color: 'hover:border-primary hover:bg-primary/5 text-primaryDark',
              },
              {
                role: 'ADMIN',
                label: 'Admin',
                icon: Settings,
                desc: 'Full administrative control, hoarding alerts, and returns tracker',
                color: 'hover:border-danger hover:bg-danger/5 text-danger',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.role}
                  onClick={() => handleSelectRole(item.role)}
                  className={`flex flex-col items-start text-left p-6 border-2 border-gray-100 rounded-2xl transition-all duration-300 hover:shadow-soft hover:scale-[1.02] cursor-pointer group space-y-3 ${item.color}`}
                >
                  <div className="p-3 bg-surface rounded-xl group-hover:bg-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-base">{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8">
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to role selection
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-1 text-ink">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">
            Logging in as <span className="font-bold text-primary">{selectedRole.replace(/_/g, ' ')}</span>
          </p>

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

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 text-sm transition-opacity"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to={`/signup?role=${selectedRole}`} className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>

          <div className="mt-6 p-3 bg-surface/50 border border-gray-100 rounded-xl">
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              We have pre-filled this form with demo account credentials for easy testing. Click login or clear to input your own.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
