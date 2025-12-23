import { toast } from 'sonner'

import { Button } from '~/components/ui/button/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip/Tooltip'
import { useSetTheme, useThemeAtomValue } from '~/hooks/common/useDark'

export const Component = () => {
  const theme = useThemeAtomValue()
  const setTheme = useSetTheme()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Vite Logo */}
              <svg
                className="w-10 h-10"
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
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  SmartPick
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {[
                  {
                    value: 'light',
                    icon: 'i-mingcute-sun-line',
                    label: 'Light',
                  },
                  {
                    value: 'dark',
                    icon: 'i-mingcute-moon-line',
                    label: 'Dark',
                  },
                  {
                    value: 'system',
                    icon: 'i-mingcute-monitor-line',
                    label: 'System',
                  },
                ].map(({ value, icon, label }) => (
                  <Tooltip key={value}>
                    <TooltipTrigger>
                      <button
                        type="button"
                        onClick={() => setTheme(value as any)}
                        className={`
                          size-8 flex items-center justify-center rounded-md transition-all
                          ${
                            theme === value
                              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }
                        `}
                      >
                        <i className={`${icon} w-4 h-4`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{label}</span>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              <button
                type="button"
                onClick={() => toast.info('User menu coming soon!')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <i className="i-mingcute-user-4-line w-4 h-4" />
                <span className="font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-sm text-green-700 dark:text-green-400 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              SmartPick
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Your AI-powered cashew classification system is ready to use. Manage
            your operations with ease.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => toast.success('Starting new session...')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-3 h-auto text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <i className="i-mingcute-rocket-line w-5 h-5 mr-2" />
              Start Classification
            </Button>

            <Button
              onClick={() => toast.info('Opening reports...')}
              className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-8 py-3 h-auto text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
            >
              <i className="i-mingcute-chart-bar-line w-5 h-5 mr-2" />
              View Reports
            </Button>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="i-mingcute-box-line w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                +12.5%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              1,247
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Items Processed Today
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="i-mingcute-check-circle-line w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                99.9%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              99.87%
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Classification Accuracy
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-green-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="i-mingcute-time-line w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              2.4s
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Average Processing Time
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: 'i-mingcute-settings-3-line',
                label: 'Settings',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: 'i-mingcute-history-line',
                label: 'History',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: 'i-mingcute-user-group-line',
                label: 'Users',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: 'i-mingcute-download-2-line',
                label: 'Export',
                color: 'from-orange-500 to-orange-600',
              },
            ].map((action) => (
              <button
                type="button"
                key={action.label}
                onClick={() => toast.info(`Opening ${action.label}...`)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 mx-auto shadow-lg`}
                >
                  <i className={`${action.icon} w-6 h-6 text-white`} />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* System Info */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            System Information
          </h2>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Classification Grades
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  24 different cashew grades supported
                </p>
                <div className="flex flex-wrap gap-2">
                  {['W180', 'W210', 'W240', 'W320', 'W450', 'W500'].map(
                    (grade) => (
                      <span
                        key={grade}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                      >
                        {grade}
                      </span>
                    ),
                  )}
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                    +18 more
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  About SmartPick
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  AI-powered precision cashew classification system with
                  real-time processing and industry-leading accuracy.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  © 2025 Delta X
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
