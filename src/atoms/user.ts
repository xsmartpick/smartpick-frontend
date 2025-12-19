import { atom } from 'jotai'

import { createAtomHooks } from '~/lib/jotai'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  avatar?: string
  createdAt: string
  lastLoginAt?: string
}

// TODO: replace with actual API call later
const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
}

const baseUserAtom = atom<User | null>(mockUser)

export const [userAtom, useUser, useUserValue, useSetUser, getUser, setUser] =
  createAtomHooks(baseUserAtom)

// Derived atoms
export const isAdminAtom = atom((get) => {
  const user = get(baseUserAtom)
  return user?.role === 'admin'
})

export const userNameAtom = atom((get) => {
  const user = get(baseUserAtom)
  return user?.name ?? 'Guest'
})

export const userEmailAtom = atom((get) => {
  const user = get(baseUserAtom)
  return user?.email ?? ''
})
