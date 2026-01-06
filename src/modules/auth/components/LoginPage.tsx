import { useState } from 'react'

import { SegmentGroup, SegmentItem } from '~/components/ui/segment'
import { useIsDark, useSetTheme } from '~/hooks/common/useDark'

import { LoginForm } from './LoginForm'
import { QrLoginPanel } from './QrLoginPanel'

export const LoginPage = () => {
  const isDark = useIsDark()
  const setTheme = useSetTheme()
  const [loginMethod, setLoginMethod] = useState<'password' | 'qr'>('password')

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-110"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <i className="i-mingcute-sun-line w-5 h-5 text-yellow-500" />
        ) : (
          <i className="i-mingcute-moon-line w-5 h-5 text-blue-600" />
        )}
      </button>

      {/* Left Side - Branding & Features */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-lg w-full space-y-10">
          {/* Logo & Title */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start gap-4 mb-6">
              {/* Vite Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <svg
                  className="relative w-16 h-16 lg:w-20 lg:h-20"
                  viewBox="0 0 410 404"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m404.94 206.832-184.05 195.135a23.9 23.9 0 0 1-31.74 1.105l-.45-.42L4.03 206.832a16 16 0 0 1 10.695-27.8l153.09-5.9a8 8 0 0 0 7.64-7.67l5.97-152.98a16 16 0 0 1 27.79-10.66l195.06 188.59a16 16 0 0 1-.33 23.42Z"
                    fill="url(#a)"
                  />
                  <path
                    d="m284.82 170.02-117.75 124.74a11.95 11.95 0 0 1-15.87.55l-.22-.21-103.46-100.02a8 8 0 0 1 5.35-13.9l76.54-2.95a4 4 0 0 0 3.82-3.84l2.98-76.46a8 8 0 0 1 13.89-5.33l97.54 94.3a8 8 0 0 1-.17 11.71Z"
                    fill="url(#b)"
                  />
                  <defs>
                    <linearGradient
                      id="a"
                      x1="6"
                      y1="33"
                      x2="235"
                      y2="344"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#41D1FF" />
                      <stop offset="1" stopColor="#BD34FE" />
                    </linearGradient>
                    <linearGradient
                      id="b"
                      x1="194.65"
                      y1="8.82"
                      x2="236.65"
                      y2="292.82"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FFEA83" />
                      <stop offset=".08" stopColor="#FFDD35" />
                      <stop offset="1" stopColor="#FFA800" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  SmartPick
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Powered by Vite
                </p>
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-white mb-3">
              Cashew Classification System
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              AI-powered precision sorting made simple
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="i-mingcute-star-line w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">
                    24 Grade Classification
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Complete sorting for all cashew grades
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="i-mingcute-lightning-line w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">
                    99.9% Accuracy
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Industry-leading precision you can trust
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-100 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="i-mingcute-rocket-line w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">
                    Real-time Processing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Instant results for maximum efficiency
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center lg:text-left pt-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2025 Delta X
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 lg:p-10">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                <i className="i-mingcute-user-4-line w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Login Form or QR Panel */}
            <div className="space-y-6">
              <SegmentGroup
                value={loginMethod}
                onValueChanged={(value) =>
                  setLoginMethod(value as 'password' | 'qr')
                }
                className="w-full bg-gray-100 dark:bg-gray-700/50 p-1"
              >
                <SegmentItem
                  value="password"
                  label={
                    <span className="flex items-center gap-2">
                      <i className="i-mingcute-keyboard-line" />
                      Password
                    </span>
                  }
                  className="flex-1"
                />
                <SegmentItem
                  value="qr"
                  label={
                    <span className="flex items-center gap-2">
                      <i className="i-mingcute-qrcode-line" />
                      QR Code
                    </span>
                  }
                  className="flex-1"
                />
              </SegmentGroup>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {loginMethod === 'password' ? <LoginForm /> : <QrLoginPanel />}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact your system administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
