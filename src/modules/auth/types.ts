export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface User {
  id: string
  username: string
  email: string
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
