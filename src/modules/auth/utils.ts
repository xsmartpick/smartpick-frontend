import type { User } from '~/modules/auth/types'

export const normalizeAuthUser = (user: User): User => {
  if (!user.orgRole && user.role) {
    return { ...user, orgRole: user.role }
  }
  return user
}
