import { AnimatePresence, m } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button/Button'
import { Spring } from '~/lib/spring'

import { useQrLogin } from '../hooks/useQrLogin'

const PulseLoader = () => (
  <div className="flex flex-col items-center space-y-4">
    <m.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="size-48 bg-fill rounded-xl"
    />
    <m.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
      className="h-4 w-32 bg-fill rounded"
    />
  </div>
)

const QrContainer = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'error'
}) => {
  const borderColorMap = {
    default: 'border-border',
    success: 'border-green/30',
    error: 'border-red/30',
  }

  return (
    <div
      className={`bg-white p-2 rounded-xl border ${borderColorMap[variant]} mx-auto w-fit`}
    >
      {children}
    </div>
  )
}

const StatusMessage = ({
  title,
  description,
  variant = 'default',
}: {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}) => {
  const titleColorMap = {
    default: 'text-text',
    success: 'text-green',
    error: 'text-red',
  }

  return (
    <div className="space-y-1">
      <h3 className={`font-semibold ${titleColorMap[variant]}`}>{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary">{description}</p>
      )}
    </div>
  )
}

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
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <m.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={Spring.presets.smooth}
          >
            <PulseLoader />
          </m.div>
        ) : isAuthorized ? (
          <m.div
            key="authorized"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={Spring.presets.bouncy}
            className="space-y-4 text-center"
          >
            <div className="relative">
              <QrContainer variant="success">
                <QRCodeSVG
                  value={qrToken || ''}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg opacity-20"
                />
              </QrContainer>
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={Spring.presets.bouncy}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-green/10 p-4 rounded-full">
                  <i className="i-mingcute-check-circle-fill text-4xl text-green" />
                </div>
              </m.div>
            </div>
            <StatusMessage
              title="Login Successful"
              description="Redirecting you to dashboard..."
              variant="success"
            />
          </m.div>
        ) : isRejected ? (
          <m.div
            key="rejected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={Spring.presets.smooth}
            className="space-y-4 text-center"
          >
            <div className="relative mx-auto w-fit">
              <div className="blur-[2px]">
                <QrContainer variant="error">
                  <QRCodeSVG
                    value={qrToken || ''}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="rounded-lg opacity-50"
                  />
                </QrContainer>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={reload} variant="destructive">
                    Try Again
                  </Button>
                </m.div>
              </div>
            </div>
            <StatusMessage
              title="Login Cancelled"
              description="The login attempt was rejected or cancelled."
              variant="error"
            />
          </m.div>
        ) : isExpired ? (
          <m.div
            key="expired"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={Spring.presets.smooth}
            className="space-y-4 text-center"
          >
            <div className="relative mx-auto w-fit">
              <div className="blur-[2px]">
                <QrContainer>
                  <QRCodeSVG
                    value={qrToken || ''}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="rounded-lg opacity-50"
                  />
                </QrContainer>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={reload} variant="primary">
                    Reload QR
                  </Button>
                </m.div>
              </div>
            </div>
            <StatusMessage title="QR Code Expired" />
          </m.div>
        ) : qrToken ? (
          <m.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={Spring.presets.smooth}
            className="space-y-4 text-center"
          >
            <m.div
              whileHover={{ scale: 1.02 }}
              transition={Spring.presets.snappy}
            >
              <QrContainer>
                <QRCodeSVG
                  value={qrToken}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </QrContainer>
            </m.div>
            <StatusMessage
              title="Scan via Mobile App"
              description="Open the mobile app and scan the code."
            />
          </m.div>
        ) : (
          <m.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={Spring.presets.smooth}
            className="text-center space-y-4"
          >
            <p className="text-sm text-red">
              {generateError ? 'Failed to generate QR code.' : 'Unknown error'}
            </p>
            <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={reload} variant="secondary">
                Retry
              </Button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
