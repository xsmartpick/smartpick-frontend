import { QRCodeSVG } from 'qrcode.react'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button/Button'

import { useQrLogin } from '../hooks/useQrLogin'

export const QrLoginPanel = () => {
  const {
    qrToken,
    isGenerating,
    generateError,
    pollStatus,
    startGeneration,
    reload,
  } = useQrLogin()

  useEffect(() => {
    startGeneration()
  }, [])

  useEffect(() => {
    if (pollStatus === 'expired') {
      toast.error('QR Code Expired', {
        description: 'Please generate a new QR code.',
      })
    }
  }, [pollStatus])

  const isExpired = pollStatus === 'expired'
  const isRejected = pollStatus === 'rejected'
  const isAuthorized = pollStatus === 'authorized'

  return (
    <div className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
      {isGenerating ? (
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="size-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ) : isAuthorized ? (
        <div className="space-y-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="relative bg-white p-2 rounded-xl border border-green-100 dark:border-green-900 mx-auto w-fit">
            <QRCodeSVG
              value={qrToken || ''}
              size={200}
              level="H"
              includeMargin={true}
              className="rounded-lg opacity-20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                <i className="i-mingcute-check-circle-fill text-4xl text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Login Successful
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting you to dashboard...
            </p>
          </div>
        </div>
      ) : isRejected ? (
        <div className="space-y-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="relative mx-auto w-fit">
            <div className="bg-white p-2 rounded-xl border border-gray-100 dark:border-gray-700 blur-[2px]">
              <QRCodeSVG
                value={qrToken || ''}
                size={200}
                level="H"
                includeMargin={true}
                className="rounded-lg opacity-50"
              />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={reload}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                Try Again
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-red-600 dark:text-red-400">
              Login Cancelled
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The login attempt was rejected or cancelled.
            </p>
          </div>
        </div>
      ) : isExpired ? (
        <div className="space-y-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="relative mx-auto w-fit">
            <div className="bg-white p-2 rounded-xl border border-gray-100 dark:border-gray-700 blur-[2px]">
              <QRCodeSVG
                value={qrToken || ''}
                size={200}
                level="H"
                includeMargin={true}
                className="rounded-lg opacity-50"
              />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={reload}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Reload QR
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              QR Code Expired
            </h3>
          </div>
        </div>
      ) : qrToken ? (
        <div className="space-y-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-white p-2 rounded-xl border border-gray-100 dark:border-gray-700 mx-auto w-fit">
            <QRCodeSVG
              value={qrToken}
              size={200}
              level="H"
              includeMargin={true}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Scan via Mobile App
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Open the mobile app and scan the code.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-sm text-red-500">
            {generateError ? 'Failed to generate QR code.' : 'Unknown error'}
          </p>
          <Button onClick={reload} variant="secondary">
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}
