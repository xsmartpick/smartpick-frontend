export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface User {
  id: string
  username: string
  email: string
  role: string
  fullName?: string
  createdAt?: string
}

export interface LoginResponse {
  token: string
  refreshToken?: string
  user: User
  expiresIn?: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface QrGenerateResponse {
  qrToken: string
  expiresAt: string
}

export type QrStatus = 'pending' | 'authorized' | 'rejected' | 'expired'

export interface QrPollResponse {
  status: QrStatus
  token?: string
  user?: User
}
