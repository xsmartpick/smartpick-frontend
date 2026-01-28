import type { AuthRole, User } from '~/modules/auth/types'

const ADMIN_ONLY_PREFIXES = [
  '/projects',
  '/datasets',
  '/label-sets',
  '/batches',
  '/admintasks',
]

export const getUserRole = (user: User | null | undefined): AuthRole | null => {
  const role = user?.orgRole ?? user?.role
  if (!role) return null
  if (role === 'admin' || role === 'labeler') {
    return role
  }
  return null
}

export const isAdmin = (user: User | null | undefined): boolean =>
  getUserRole(user) === 'admin'

export const isLabeler = (user: User | null | undefined): boolean =>
  getUserRole(user) === 'labeler'

export const isAdminRoute = (pathname: string): boolean => {
  if (
    ADMIN_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return true
  }

  if (pathname === '/label') return false
  if (pathname === '/label/task') return false
  if (pathname.startsWith('/label/task/')) return false
  if (pathname.startsWith('/label/')) return true

  return false
}
