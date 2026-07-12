import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useLiveStore } from '@/store/useLiveStore'
import { useAuth } from '@/context/AuthContext'

export function AppLayout() {
  const init = useLiveStore((s) => s.init)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    // Re-subscribing whenever `user` changes (e.g. logging out and back in
    // as a different role) guarantees the live feed is always re-scoped to
    // whoever is currently signed in — nothing from a previous session lingers.
    const cleanup = init(user)
    return cleanup
  }, [init, user])

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
