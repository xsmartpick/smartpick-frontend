import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

import type { QrGenerateResponse, QrPollResponse } from './types'

export const generateQrCode = async () => {
  return apiClient<QrGenerateResponse>(API_ENDPOINTS.AUTH.QR.GENERATE, {
    method: 'POST',
  })
}

export const pollQrStatus = async (token: string) => {
  return apiClient<QrPollResponse>(API_ENDPOINTS.AUTH.QR.POLL(token))
}
