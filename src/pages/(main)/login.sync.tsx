import { AnimatePresence,m } from 'motion/react'
import { useEffect } from 'react'

import { useLoginMethod } from '~/atoms/auth'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import { PasswordLoginPanel } from '~/modules/auth/components/PasswordLoginPanel'
import { QrLoginPanel } from '~/modules/auth/components/QrLoginPanel'

// Simple Tab Component
const LoginTab = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: string
  label: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all relative',
      active ? 'text-text' : 'text-text-tertiary hover:text-text-secondary',
    )}
  >
    <i className={cn(icon, 'text-lg')} />
    {label}
    {active && (
      <m.div
        layoutId="tab-indicator"
        className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"
      />
    )}
  </button>
)

export const Component = () => {
  const [method, setMethod] = useLoginMethod()

  // Reset to password on mount
  useEffect(() => {
    setMethod('password')
  }, [setMethod])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-fill-tertiary p-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue/5 rounded-full blur-3xl" />
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={Spring.presets.smooth}
        className="w-full max-w-[420px] bg-background/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden z-10"
      >
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <i className="i-mingcute-fingerprint-line text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-text">Welcome Back</h1>
          <p className="text-text-secondary mt-2 text-sm">
            Enter your credentials to access your workspace
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border mt-8 px-8">
          <LoginTab
            active={method === 'password'}
            onClick={() => setMethod('password')}
            icon="i-mingcute-keyboard-line"
            label="Password"
          />
          <LoginTab
            active={method === 'qr'}
            onClick={() => setMethod('qr')}
            icon="i-mingcute-qrcode-line"
            label="QR Code"
          />
        </div>

        {/* Content Area */}
        <div className="p-8 h-[400px] relative">
          <AnimatePresence mode="wait">
            {method === 'password' ? (
              <m.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={Spring.presets.snappy}
                className="h-full"
              >
                <PasswordLoginPanel />
              </m.div>
            ) : (
              <m.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={Spring.presets.snappy}
                className="h-full"
              >
                <QrLoginPanel />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-xs text-text-quaternary">
        <p>
          Protected by reCAPTCHA and subject to the Privacy Policy and Terms of
          Service.
        </p>
      </div>
    </div>
  )
}
