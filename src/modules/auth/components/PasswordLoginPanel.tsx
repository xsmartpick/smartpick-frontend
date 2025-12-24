import { Button } from '~/components/ui/button/Button'
import { Input } from '~/components/ui/input/Input'

export const PasswordLoginPanel = () => {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">
          Email or Username
        </label>
        <Input placeholder="name@example.com" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text">Password</label>
          <a href="#" className="text-xs text-accent hover:underline">
            Forgot?
          </a>
        </div>
        <Input type="password" placeholder="••••••••" />
      </div>

      {/* FIX 1: Removed size="lg" (not supported). Added h-12 to manually match large height if needed, or stick to default */}
      <Button className="w-full h-12 text-base bg-accent text-white mt-4">
        Log In
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-text-tertiary">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* FIX 2: Changed variant="outline" (not supported) to "secondary" or "ghost" with border */}
        <Button
          variant="secondary"
          className="w-full border border-border bg-transparent hover:bg-fill-secondary"
        >
          <i className="i-mingcute-google-fill mr-2" /> Google
        </Button>
        <Button
          variant="secondary"
          className="w-full border border-border bg-transparent hover:bg-fill-secondary"
        >
          <i className="i-mingcute-github-fill mr-2" /> GitHub
        </Button>
      </div>
    </div>
  )
}
