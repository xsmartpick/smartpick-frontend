import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { tokenAtom, userAtom } from '~/atoms/auth'
import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

import type { LoginRequest, LoginResponse } from '../types'

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
      // Store token and user in state
      setToken(data.token)
      setUser(data.user)

      // Show success message
      toast.success(`Welcome back, ${data.user.username}!`, {
        description: 'You have been successfully logged in.',
      })

      // Redirect to home page
      navigate('/')
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
