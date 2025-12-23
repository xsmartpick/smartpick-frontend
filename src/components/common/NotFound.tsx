import { useLocation, useNavigate } from 'react-router'

import { Button } from '../ui/button'

export const NotFound = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col transition-colors">
      {/* Spacer */}
      <div className="h-16" />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse" />
              <svg
                className="relative w-32 h-32 mx-auto mb-6"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray="10 5"
                  className="animate-spin"
                  style={{ animationDuration: '10s' }}
                />
                <text
                  x="50"
                  y="60"
                  textAnchor="middle"
                  className="text-3xl font-bold fill-gray-800 dark:fill-white"
                >
                  ?
                </text>
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                404
              </span>
            </h1>

            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
              Page Not Found
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>

          {/* Current path info */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <i className="i-mingcute-alert-line w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Requested URL:
                </p>
                <code className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg break-all block">
                  {location.pathname}
                </code>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <i className="i-mingcute-home-line w-5 h-5 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 h-12 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
            >
              <i className="i-mingcute-arrow-left-line w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Need help?</span> Check the URL or
              contact your system administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2025 Delta X
        </p>
      </div>
    </div>
  )
}
