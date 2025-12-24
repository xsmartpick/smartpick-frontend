import { atom } from 'jotai'

import { createAtomHooks } from '~/lib/jotai'

// --- Types ---
export type QrStatus = 'loading' | 'pending' | 'scanned' | 'success' | 'expired'

// --- Atoms ---
// Tracks the current state of the QR login process
export const [qrStatusAtom, useQrStatus, useQrStatusValue, useSetQrStatus] =
  createAtomHooks(atom<QrStatus>('loading'))

// Tracks which login method is active (Password vs QR)
export const [loginMethodAtom, useLoginMethod] = createAtomHooks(
  atom<'password' | 'qr'>('password'),
)
