import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { setToken, setUser } from '~/atoms/auth'
import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'
import type { AuthRole } from '~/modules/auth/types'
import { normalizeAuthUser } from '~/modules/auth/utils'

type OnboardResponse = {
  token: string
  user: {
    id: string
    username: string
    email: string
    fullName: string
    orgRole?: AuthRole
    role?: AuthRole
  }
}

type MeResponse = {
  userId: string
  username: string
}

/**
 * Gateway route for labeler QR login
 *
 * Flow:
 * 1. Check if token exists in localStorage
 * 2. If yes → validate with /me → redirect to /label
 * 3. If no → call /labeler/onboard → save token → redirect to /label
 */
export const Component = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<
    'checking' | 'onboarding' | 'redirecting' | 'error'
  >('checking')
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check if token exists
        const storedToken = localStorage.getItem('smartpick_token')
        const hasToken = storedToken && storedToken !== 'null'

        if (hasToken) {
          // Validate existing token
          setStatus('checking')
          try {
            await apiClient<MeResponse>(API_ENDPOINTS.AUTH.ME, {
              timeout: 5000,
            })
            // Token is valid, redirect to labeling
            setStatus('redirecting')
            navigate('/label', { replace: true })
            return
          } catch {
            // Token invalid, clear and continue to onboard
            localStorage.removeItem('smartpick_token')
            localStorage.removeItem('smartpick_user')
          }
        }

        // No valid token, create new labeler account
        setStatus('onboarding')

        const response = await apiClient<OnboardResponse>(
          API_ENDPOINTS.AUTH.LABELER_ONBOARD,
          { method: 'POST', timeout: 10000 },
        )

        // Prepare user with default role
        const user = normalizeAuthUser({
          ...response.user,
          orgRole: response.user.orgRole ?? response.user.role ?? 'labeler',
        })

        // Save token and user to localStorage (JSON format for atomWithStorage)
        localStorage.setItem('smartpick_token', JSON.stringify(response.token))
        localStorage.setItem('smartpick_user', JSON.stringify(user))

        // Update Jotai atoms
        setToken(response.token)
        setUser(user)

        // Redirect to labeling
        setStatus('redirecting')
        navigate('/label', { replace: true })
      } catch (error) {
        console.error('Failed to authenticate:', error)
        setStatus('error')
        setErrorMsg(error instanceof Error ? error.message : '')
      }
    }

    handleAuth()
  }, [navigate])

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <p className="font-medium text-red-500">
            {t('auth.gateway.error.title')}
          </p>
          <p className="text-sm text-text-secondary">
            {errorMsg || t('auth.gateway.error.unknown')}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-accent px-4 py-2 text-white"
          >
            {t('auth.gateway.error.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-text-secondary">
          {status === 'checking' ? (
            <span>{t('auth.gateway.checking')}</span>
          ) : status === 'onboarding' ? (
            <span>{t('auth.gateway.onboarding')}</span>
          ) : (
            <span>{t('auth.gateway.redirecting')}</span>
          )}
        </p>
      </div>
    </div>
  )
}
