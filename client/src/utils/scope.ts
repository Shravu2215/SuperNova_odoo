import type { User } from '@/types'

/**
 * ADMIN and ASSET_MANAGER operate assets org-wide; DEPARTMENT_HEAD and EMPLOYEE
 * only see what's theirs. The backend itself enforces this via role-gated routes
 * (e.g. GET /allocations vs GET /allocations/my) — this helper just decides which
 * endpoint/view a page should use, it isn't a security boundary on its own.
 */
export function canSeeOrgWide(user: User | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER'
}
