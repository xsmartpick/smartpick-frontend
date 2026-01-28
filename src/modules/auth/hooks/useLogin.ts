import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { tokenAtom, userAtom } from '~/atoms/auth'
import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'
import type { LoginRequest, LoginResponse } from '~/modules/auth/types'
import { normalizeAuthUser } from '~/modules/auth/utils'

export const useLogin = () => {
  const setToken = useSetAtom(tokenAtom)
  const setUser = useSetAtom(userAtom)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: 'POST',
          body: credentials,
        },
      )
      return response
    },
    onSuccess: (data) => {
      const normalizedUser = normalizeAuthUser(data.user)
      // IMPORTANT: Write to localStorage SYNCHRONOUSLY before updating Jotai atoms
      // This ensures the token is available for subsequent API calls immediately
      // Jotai's atomWithStorage stores values as JSON
      localStorage.setItem('smartpick_token', JSON.stringify(data.token))
      localStorage.setItem('smartpick_user', JSON.stringify(normalizedUser))

      // Also update Jotai state (this may be async but localStorage is already set)
      setToken(data.token)
      setUser(normalizedUser)

      // Show success message
      toast.success(`Welcome back, ${normalizedUser.username}!`, {
        description: 'You have been successfully logged in.',
      })

      // Small delay to ensure state propagation before navigation
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 100)
    },
    onError: (error: any) => {
      // Handle login errors
      const message =
        error.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.'

      toast.error('Login Failed', {
        description: message,
      })
    },
  })
}
