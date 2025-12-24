import { AnimatePresence,m } from 'motion/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { useQrStatus } from '~/atoms/auth'
import { Button } from '~/components/ui/button/Button'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

export const QrLoginPanel = () => {
  const [status, setStatus] = useQrStatus()

  // FIX 1: Lazy initialization. Generates URL only once on mount.
  // Removes the need for useEffect to set it.
  const [qrUrl, setQrUrl] = useState(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MockLoginToken-${Date.now()}&color=5d5d5d`,
  )

  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [showDevTools, setShowDevTools] = useState(false)

  // FIX 1 (Continued): useEffect now only handles status logic, not URL setting
  useEffect(() => {
    if (status === 'loading' && isImageLoaded) {
      setStatus('pending')
    }
  }, [isImageLoaded, status, setStatus])

  const handleImageLoad = () => {
    setIsImageLoaded(true)
    if (status === 'loading') {
      setStatus('pending')
    }
  }

  // --- Manual Mock Handlers ---
  const handleSimulateScan = () => {
    setStatus('scanned')
    toast.info('QR Code scanned! Waiting for confirmation...')
  }

  const handleSimulateConfirm = () => {
    setStatus('success')
    toast.success('Login Confirmed! Redirecting...')

    setTimeout(() => {
      // FIX 2: Use console.info instead of console.log to satisfy linter
      console.info('Navigate to Dashboard')
    }, 2000)
  }

  const handleRefresh = () => {
    setIsImageLoaded(false)
    setStatus('loading')
    setQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MockLoginToken-${Date.now()}&color=5d5d5d`,
    )
  }

  // --- Floating Dev Tools (Rendered via Portal) ---
  const DevTools = (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-auto">
      <m.button
        layout
        onClick={() => setShowDevTools(!showDevTools)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all shadow-lg border border-white/10 backdrop-blur-md',
          showDevTools
            ? 'bg-accent text-white'
            : 'bg-black/80 text-white/80 hover:bg-black hover:text-white',
        )}
      >
        <i className="i-mingcute-terminal-box-line text-sm" />
        <span>Dev Controls</span>
        <div
          className={cn(
            'w-2 h-2 rounded-full animate-pulse',
            status === 'success' ? 'bg-green-400' : 'bg-orange-400',
          )}
        />
      </m.button>

      <AnimatePresence>
        {showDevTools && (
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
            transition={Spring.presets.snappy}
            className="mt-3 p-3 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-48 flex flex-col gap-2 overflow-hidden"
          >
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                Debug Actions
              </span>
              <span className="text-[10px] text-accent font-mono">
                {status}
              </span>
            </div>

            <div className="space-y-1">
              <Button
                variant="ghost"
                className="h-8 w-full text-xs justify-start px-3 text-white/90 hover:bg-white/10 hover:text-white rounded-lg"
                onClick={handleSimulateScan}
                disabled={status !== 'pending'}
              >
                <span className="w-5 flex justify-center mr-2">
                  <i className="i-mingcute-scan-line" />
                </span>
                1. Simulate Scan
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-full text-xs justify-start px-3 text-white/90 hover:bg-white/10 hover:text-white rounded-lg"
                onClick={handleSimulateConfirm}
                disabled={status !== 'scanned'}
              >
                <span className="w-5 flex justify-center mr-2">
                  <i className="i-mingcute-check-circle-line" />
                </span>
                2. Simulate Confirm
              </Button>
            </div>

            <div className="h-px bg-white/10 my-1" />

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                className="h-8 text-xs justify-center px-0 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg"
                onClick={() => setStatus('expired')}
              >
                Expire
              </Button>
              <Button
                variant="ghost"
                className="h-8 text-xs justify-center px-0 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
                onClick={handleRefresh}
              >
                Reset
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full py-2">
      {createPortal(DevTools, document.body)}

      <div className="relative group">
        <div
          className={cn(
            'relative w-48 h-48 rounded-xl overflow-hidden bg-white p-2 border-2 transition-all duration-300',
            status === 'expired'
              ? 'border-red/50 blur-sm opacity-50'
              : 'border-border',
            status === 'success' ? 'border-accent/50 scale-105' : '',
            'shadow-sm',
          )}
        >
          {(!isImageLoaded || status === 'loading') && status !== 'success' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-fill-tertiary animate-pulse">
              <i className="i-mingcute-loading-line animate-spin text-2xl text-text-secondary" />
            </div>
          )}

          {status !== 'success' && (
            <img
              src={qrUrl}
              onLoad={handleImageLoad}
              alt="Login QR Code"
              className={cn(
                'w-full h-full object-contain mix-blend-multiply transition-opacity duration-300',
                isImageLoaded ? 'opacity-100' : 'opacity-0',
              )}
            />
          )}

          <AnimatePresence>
            {status === 'scanned' && (
              <m.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={Spring.presets.bouncy}
                className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center border-2 border-green">
                    <i className="i-mingcute-check-line text-green text-2xl" />
                  </div>
                  <span className="text-xs font-semibold text-text-secondary">
                    Scanned
                  </span>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {status === 'success' && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-fill/50"
              >
                <div className="relative w-12 h-12">
                  <m.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: 'linear',
                    }}
                    className="w-full h-full border-4 border-accent/30 border-t-accent rounded-full"
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {status === 'expired' && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Button
              onClick={handleRefresh}
              variant="primary"
              className="shadow-xl"
            >
              <i className="i-mingcute-refresh-line mr-2" />
              Reload QR
            </Button>
          </div>
        )}
      </div>

      {/* FIX 3: Wrapped all conditional text strings in <span> to prevent Google Translate crashes */}
      <div className="mt-6 text-center space-y-1 min-h-[60px]">
        <h3 className="text-lg font-semibold text-text">
          {status === 'loading' && <span>Generating Code...</span>}
          {status === 'pending' && <span>Scan via Mobile App</span>}
          {status === 'scanned' && <span>Check your phone</span>}
          {status === 'success' && <span>Redirecting...</span>}
          {status === 'expired' && <span>QR Code Expired</span>}
        </h3>
        <p className="text-sm text-text-secondary max-w-[300px] mx-auto">
          {status === 'pending' && (
            <span>Open the mobile app and scan the code.</span>
          )}
          {status === 'scanned' && (
            <span>Confirm the login on your device.</span>
          )}
          {status === 'success' && (
            <span>You are being securely logged in.</span>
          )}
        </p>
      </div>
    </div>
  )
}
