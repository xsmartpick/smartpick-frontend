import { useLocation, useNavigate } from 'react-router'

import { Button } from '../ui/button'

export const NotFound = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors">
      {/* Spacer */}
      <div className="h-16" />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent rounded-full blur-3xl opacity-30 animate-pulse" />
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
                  className="text-3xl font-bold fill-text"
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
              <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                404
              </span>
            </h1>

            <h2 className="text-3xl font-bold text-text mb-3">
              Page Not Found
            </h2>

            <p className="text-lg text-text-secondary mb-8">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>

          {/* Current path info */}
          <div className="bg-material-medium backdrop-blur-md rounded-2xl p-6 shadow-lg border border-border mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange to-red rounded-lg flex items-center justify-center">
                <i className="i-mingcute-alert-line w-5 h-5 text-background" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-text mb-2">
                  Requested URL:
                </p>
                <code className="text-sm font-mono text-text-secondary bg-fill px-3 py-2 rounded-lg break-all block">
                  {location.pathname}
                </code>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-accent hover:bg-accent/90 text-background border-0 h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <i className="i-mingcute-home-line w-5 h-5 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={() => navigate(-1)}
              className="flex-1 bg-fill text-text border border-border h-12 font-semibold hover:bg-fill-secondary transition-all"
            >
              <i className="i-mingcute-arrow-left-line w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Help text */}
          <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold">Need help?</span> Check the URL or
              contact your system administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-sm text-text-tertiary">© 2025 Delta X</p>
      </div>
    </div>
  )
}
