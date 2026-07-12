import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { AppLayout } from '@/components/layout/AppLayout'

import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { AllocationsPage } from '@/pages/AllocationsPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { AuditPage } from '@/pages/AuditPage'
import { OrganizationPage } from '@/pages/OrganizationPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Every role lands here — content inside is scoped per-role, not the route itself */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />

            <Route path="/allocations" element={<AllocationsPage />} />

            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            <Route
              path="/audits"
              element={
                <RoleGuard requiredRoles={['ADMIN', 'ASSET_MANAGER']}>
                  <AuditPage />
                </RoleGuard>
              }
            />

            <Route
              path="/organization"
              element={
                <RoleGuard requiredRoles={['ADMIN']}>
                  <OrganizationPage />
                </RoleGuard>
              }
            />

            <Route
              path="/reports"
              element={
                <RoleGuard requiredRoles={['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']}>
                  <ReportsPage />
                </RoleGuard>
              }
            />

            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
