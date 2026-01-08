import type { FC } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { Footer } from './components/common/Footer'
import { RootProviders } from './providers/root-providers'

export const App: FC = () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <RootProviders>
      <AppLayer />
      <Footer />
    </RootProviders>
  )
}

const AppLayer = () => {
  const appIsReady = true
  return appIsReady ? <Outlet /> : <AppSkeleton />
}

const AppSkeleton = () => {
  return null
}
export default App
