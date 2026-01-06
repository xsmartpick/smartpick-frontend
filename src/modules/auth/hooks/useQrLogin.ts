import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { tokenAtom, useQrSession, userAtom } from '~/atoms/auth'

import { generateQrCode, pollQrStatus } from '../api'

export const useQrLogin = () => {
  const [qrSession, setQrSession] = useQrSession()

  const setToken = useSetAtom(tokenAtom)
  const setUser = useSetAtom(userAtom)
  const navigate = useNavigate()

  // Generate QR Code
  const {
    refetch: generate,
    isFetching: isGenerating,
    error: generateError,
  } = useQuery({
    queryKey: ['auth', 'qr', 'generate'],
    queryFn: generateQrCode,
    enabled: false,
    retry: false,
  })

  const startGeneration = async () => {
    // If we already have a valid session, don't regenerate
    if (qrSession?.qrToken) {
      // Check expiry? Optional, but poll will handle 'expired' status anyway
      return
    }

    try {
      const { data } = await generate()
      if (data) {
        setQrSession({
          qrToken: data.qrToken,
          expiresAt: data.expiresAt,
        })
      }
    } catch (error) {
      console.error('Failed to generate QR code', error)
      toast.error('Failed to generate QR code')
    }
  }

  // Poll Status
  const { data: pollData } = useQuery({
    queryKey: ['auth', 'qr', 'poll', qrSession?.qrToken],
    queryFn: () => pollQrStatus(qrSession!.qrToken),
    enabled: !!qrSession?.qrToken,
    refetchInterval: (query) => {
      const {data} = query.state
      if (!data) return 2000
      if (['authorized', 'rejected', 'expired'].includes(data.status)) {
        return false
      }
      return 2000
    },
    retry: 1,
  })

  // Handle Poll Side Effects
  useEffect(() => {
    if (!pollData) return

    if (pollData.status === 'authorized' && pollData.token && pollData.user) {
      setToken(pollData.token)
      setUser(pollData.user)
      toast.success('Login Successful', {
        description: `Welcome back, ${pollData.user.username}!`,
      })
      navigate('/')
    }

    if (pollData.status === 'rejected') {
      // Just let the UI handle the rejected state
    }

    // Auto-expire check vs client time could be added, but backend status is authoritative
  }, [pollData, setToken, setUser, navigate, setQrSession])

  const reload = () => {
    setQrSession(null)
    generate().then(({ data }) => {
      if (data) {
        setQrSession({
          qrToken: data.qrToken,
          expiresAt: data.expiresAt,
        })
      }
    })
  }

  return {
    qrToken: qrSession?.qrToken,
    expiresAt: qrSession?.expiresAt,
    isGenerating,
    generateError,
    pollStatus: pollData?.status || 'idle',
    startGeneration,
    reload,
  }
}
