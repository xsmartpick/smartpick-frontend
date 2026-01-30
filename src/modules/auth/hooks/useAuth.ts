import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { isAuthenticatedAtom, tokenAtom, userAtom } from '~/atoms/auth'

export const useAuth = () => {
  const user = useAtomValue(userAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const setUser = useSetAtom(userAtom)
  const setToken = useSetAtom(tokenAtom)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const logout = useCallback(() => {
    // Clear state
    setUser(null)
    setToken(null)

    // Clear localStorage
    localStorage.removeItem('smartpick_token')
    localStorage.removeItem('smartpick_user')

    // Show message
    toast.info(t('auth.toast.logoutSuccess'))

    // Redirect to login
    navigate('/login')
  }, [setUser, setToken, navigate, t])

  return {
    user,
    isAuthenticated,
    logout,
  }
}
