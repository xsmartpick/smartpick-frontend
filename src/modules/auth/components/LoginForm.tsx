import { useState } from 'react'

import { Button } from '~/components/ui/button/Button'
import { Checkbox } from '~/components/ui/checkbox/Checkbox'
import { Input } from '~/components/ui/input/Input'
import { Label } from '~/components/ui/label/Label'

import { useLogin } from '../hooks/useLogin'

export const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({ username: '', password: '' })

  const loginMutation = useLogin()

  const validateForm = () => {
    const newErrors = { username: '', password: '' }
    let isValid = true

    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required'
      isValid = false
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
      isValid = false
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({ username: '', password: '' })

    // Validate
    if (!validateForm()) {
      return
    }

    // Submit
    loginMutation.mutate({ username, password, rememberMe })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username field */}
      <div>
        <Label
          htmlFor="username"
          className="text-gray-700 dark:text-gray-200 font-medium"
        >
          Username or Email
        </Label>
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="i-mingcute-user-3-line w-5 h-5 text-gray-400" />
          </div>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            hasError={!!errors.username}
            disabled={loginMutation.isPending}
            autoComplete="username"
            className="pl-12 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {errors.username && (
          <p className="text-sm text-red-500 dark:text-red-400 mt-2 flex items-center gap-1">
            <i className="i-mingcute-alert-circle-line w-4 h-4" />
            {errors.username}
          </p>
        )}
      </div>

      {/* Password field */}
      <div>
        <Label
          htmlFor="password"
          className="text-gray-700 dark:text-gray-200 font-medium"
        >
          Password
        </Label>
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="i-mingcute-lock-line w-5 h-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            hasError={!!errors.password}
            disabled={loginMutation.isPending}
            autoComplete="current-password"
            className="pl-12 h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 dark:text-red-400 mt-2 flex items-center gap-1">
            <i className="i-mingcute-alert-circle-line w-4 h-4" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          disabled={loginMutation.isPending}
        />
        <Label
          htmlFor="remember"
          className="cursor-pointer text-sm text-gray-600 dark:text-gray-300"
        >
          Keep me signed in for 30 days
        </Label>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
        isLoading={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <span className="flex items-center gap-2">
            <i className="i-mingcute-loading-line w-5 h-5 animate-spin" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <i className="i-mingcute-right-line w-5 h-5" />
            Sign In
          </span>
        )}
      </Button>
    </form>
  )
}
