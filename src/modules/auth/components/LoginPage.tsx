import { AnimatePresence, m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SegmentGroup, SegmentItem } from '~/components/ui/segment'
import { useIsDark, useSetTheme } from '~/hooks/common/useDark'
import { Spring } from '~/lib/spring'

import { LoginForm } from './LoginForm'
import { QrLoginPanel } from './QrLoginPanel'

const StaggerItem = ({
  children,
  delay,
  className,
}: {
  children: React.ReactNode
  delay: number
  className?: string
}) => (
  <m.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...Spring.presets.smooth, delay }}
    className={className}
  >
    {children}
  </m.div>
)

const FeatureCard = ({
  icon,
  iconClass,
  title,
  description,
  delay,
}: {
  icon: string
  iconClass: string
  title: string
  description: string
  delay: number
}) => (
  <StaggerItem delay={delay}>
    <m.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={Spring.presets.snappy}
      className="rounded-2xl border border-border bg-background/60 p-5 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass} shadow-lg`}
        >
          <i className={`${icon} h-5 w-5 text-background`} />
        </div>
        <div>
          <h3 className="font-semibold text-text">{title}</h3>
          <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
        </div>
      </div>
    </m.div>
  </StaggerItem>
)

export const LoginPage = () => {
  const { t } = useTranslation()
  const isDark = useIsDark()
  const setTheme = useSetTheme()
  const [loginMethod, setLoginMethod] = useState<'password' | 'qr'>('password')

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-accent/3 blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <m.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...Spring.presets.bouncy, delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/80 backdrop-blur-sm shadow-lg transition-colors hover:bg-fill"
        aria-label={t('auth.login.form.toggleTheme')}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <m.i
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={Spring.presets.bouncy}
              className="i-mingcute-sun-line h-5 w-5 text-yellow"
            />
          ) : (
            <m.i
              key="moon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={Spring.presets.bouncy}
              className="i-mingcute-moon-line h-5 w-5 text-accent"
            />
          )}
        </AnimatePresence>
      </m.button>

      {/* Left Side - Branding & Features */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-lg w-full space-y-10">
          {/* Logo & Title */}
          <StaggerItem delay={0}>
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center lg:justify-start gap-4 mb-6">
                {/* Logo */}
                <m.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={Spring.presets.bouncy}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-accent rounded-2xl blur-xl opacity-30" />
                  <div className="relative flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/70 shadow-xl shadow-accent/20">
                    <svg
                      className="h-9 w-9 lg:h-11 lg:w-11 text-background"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                </m.div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-accent">
                    SmartPick
                  </h1>
                  <p className="text-text-secondary text-sm mt-1">
                    {t('auth.login.branding.subtitle')}
                  </p>
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-semibold text-text mb-3">
                {t('auth.login.branding.systemName')}
              </p>
              <p className="text-text-secondary text-lg">
                {t('auth.login.branding.tagline')}
              </p>
            </div>
          </StaggerItem>

          {/* Feature Cards */}
          <div className="space-y-3">
            <FeatureCard
              icon="i-mingcute-star-line"
              iconClass="bg-accent"
              title={t('auth.login.features.gradeClassification.title')}
              description={t(
                'auth.login.features.gradeClassification.description',
              )}
              delay={0.1}
            />
            <FeatureCard
              icon="i-mingcute-lightning-line"
              iconClass="bg-green"
              title={t('auth.login.features.accuracy.title')}
              description={t('auth.login.features.accuracy.description')}
              delay={0.15}
            />
            <FeatureCard
              icon="i-mingcute-rocket-line"
              iconClass="bg-orange"
              title={t('auth.login.features.processing.title')}
              description={t('auth.login.features.processing.description')}
              delay={0.2}
            />
          </div>

          {/* Footer */}
          <StaggerItem delay={0.25}>
            <div className="text-center lg:text-left pt-4">
              <p className="text-text-tertiary text-sm">
                {t('auth.login.branding.copyright')}
              </p>
            </div>
          </StaggerItem>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <m.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...Spring.presets.smooth, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-border bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/5 p-8 lg:p-10">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...Spring.presets.bouncy, delay: 0.2 }}
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent shadow-lg shadow-accent/20 mb-4"
              >
                <i className="i-mingcute-user-4-line h-8 w-8 text-background" />
              </m.div>
              <h2 className="text-3xl font-bold text-text mb-2">
                {t('auth.login.form.welcomeTitle')}
              </h2>
              <p className="text-text-secondary">
                {t('auth.login.form.welcomeSubtitle')}
              </p>
            </div>

            {/* Login Method Selector */}
            <div className="space-y-6">
              <SegmentGroup
                value={loginMethod}
                onValueChanged={(value) =>
                  setLoginMethod(value as 'password' | 'qr')
                }
                className="w-full bg-fill p-1"
              >
                <SegmentItem
                  value="password"
                  label={
                    <span className="flex items-center gap-2">
                      <i className="i-mingcute-keyboard-line" />
                      {t('auth.login.form.password')}
                    </span>
                  }
                  className="flex-1"
                />
                <SegmentItem
                  value="qr"
                  label={
                    <span className="flex items-center gap-2">
                      <i className="i-mingcute-qrcode-line" />
                      {t('auth.login.form.qrCode')}
                    </span>
                  }
                  className="flex-1"
                />
              </SegmentGroup>

              <AnimatePresence mode="wait">
                <m.div
                  key={loginMethod}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={Spring.presets.smooth}
                >
                  {loginMethod === 'password' ? (
                    <LoginForm />
                  ) : (
                    <QrLoginPanel />
                  )}
                </m.div>
              </AnimatePresence>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-text-tertiary">
                {t('auth.login.form.needHelp')}
              </p>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  )
}
