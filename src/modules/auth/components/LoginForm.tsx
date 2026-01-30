import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/ui/button/Button'
import { Checkbox } from '~/components/ui/checkbox/Checkbox'
import { Input } from '~/components/ui/input/Input'
import { Label } from '~/components/ui/label/Label'
import { Spring } from '~/lib/spring'

import { useLogin } from '../hooks/useLogin'

const FormField = ({
  children,
  delay,
}: {
  children: React.ReactNode
  delay: number
}) => (
  <m.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...Spring.presets.smooth, delay }}
  >
    {children}
  </m.div>
)

export const LoginForm = () => {
  const { t } = useTranslation()
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
      newErrors.username = t('auth.login.form.validation.usernameRequired')
      isValid = false
    } else if (username.length < 3) {
      newErrors.username = t('auth.login.form.validation.usernameMinLength')
      isValid = false
    }

    // Password validation
    if (!password) {
      newErrors.password = t('auth.login.form.validation.passwordRequired')
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = t('auth.login.form.validation.passwordMinLength')
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
      <FormField delay={0}>
        <Label htmlFor="username" className="text-text font-medium">
          {t('auth.login.form.username')}
        </Label>
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <i className="i-mingcute-user-3-line w-[18px] h-[18px] text-text-tertiary" />
          </div>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('auth.login.form.usernamePlaceholder')}
            hasError={!!errors.username}
            disabled={loginMutation.isPending}
            autoComplete="username"
            inputClassName="pl-10 h-11 bg-fill border-border rounded-xl"
          />
        </div>
        {errors.username && (
          <m.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.snappy}
            className="text-sm text-red mt-2 flex items-center gap-1.5"
          >
            <i className="i-mingcute-alert-circle-line w-4 h-4" />
            {errors.username}
          </m.p>
        )}
      </FormField>

      {/* Password field */}
      <FormField delay={0.05}>
        <Label htmlFor="password" className="text-text font-medium">
          {t('auth.login.form.password')}
        </Label>
        <div className="mt-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <i className="i-mingcute-lock-line w-[18px] h-[18px] text-text-tertiary" />
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.login.form.passwordPlaceholder')}
            hasError={!!errors.password}
            disabled={loginMutation.isPending}
            autoComplete="current-password"
            inputClassName="pl-10 h-11 bg-fill border-border rounded-xl"
          />
        </div>
        {errors.password && (
          <m.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.snappy}
            className="text-sm text-red mt-2 flex items-center gap-1.5"
          >
            <i className="i-mingcute-alert-circle-line w-4 h-4" />
            {errors.password}
          </m.p>
        )}
      </FormField>

      {/* Remember me */}
      <FormField delay={0.1}>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={loginMutation.isPending}
          />
          <Label
            htmlFor="remember"
            className="cursor-pointer text-sm text-text-secondary"
          >
            {t('auth.login.form.rememberMe')}
          </Label>
        </div>
      </FormField>

      {/* Submit button */}
      <FormField delay={0.15}>
        <m.div whileTap={{ scale: 0.98 }} transition={Spring.presets.snappy}>
          <Button
            type="submit"
            variant="primary"
            className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-accent/20"
            isLoading={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              t('auth.login.form.signingIn')
            ) : (
              <span className="flex items-center gap-2">
                {t('auth.login.form.signIn')}
                <i className="i-mingcute-arrow-right-line w-4 h-4" />
              </span>
            )}
          </Button>
        </m.div>
      </FormField>
    </form>
  )
}
