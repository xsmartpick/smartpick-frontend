import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { createAtomHooks } from '~/lib/jotai'
import type { User } from '~/modules/auth/types'

// Token stored in localStorage (persisted)
export const [
  tokenAtom,
  useToken,
  useTokenValue,
  useSetToken,
  getToken,
  setToken,
] = createAtomHooks(atomWithStorage<string | null>('smartpick_token', null))

// User state (stored after login)
export const [userAtom, useUser, useUserValue, useSetUser, getUser, setUser] =
  createAtomHooks(atom<User | null>(null))

// Computed: isAuthenticated (token exists AND user exists)
export const isAuthenticatedAtom = atom((get) => {
  const token = get(tokenAtom)
  const user = get(userAtom)
  return token !== null && user !== null
})
