import { atom, useAtomValue } from 'jotai'
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

// User state (persisted in localStorage)
export const [userAtom, useUser, useUserValue, useSetUser, getUser, setUser] =
  createAtomHooks(atomWithStorage<User | null>('smartpick_user', null))

// Computed: isAuthenticated (token exists AND user exists)
export const isAuthenticatedAtom = atom((get) => {
  const token = get(tokenAtom)
  const user = get(userAtom)
  return token !== null && user !== null
})

// Hook to get isAuthenticated value
export const useIsAuthenticated = () => useAtomValue(isAuthenticatedAtom)

// QR Session State (persisted in memory while app is open)
export const [
  qrSessionAtom,
  useQrSession,
  useQrSessionValue,
  useSetQrSession,
  getQrSession,
  setQrSession,
] = createAtomHooks(atom<{ qrToken: string; expiresAt: string } | null>(null))
