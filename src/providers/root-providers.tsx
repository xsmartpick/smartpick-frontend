import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'jotai'
import type { FC, PropsWithChildren } from 'react'
import * as React from 'react'

import { ModalContainer } from '~/components/ui/modal'
import { Toaster } from '~/components/ui/sonner'
import { jotaiStore } from '~/lib/jotai'
import { queryClient } from '~/lib/query-client'

import { ContextMenuProvider } from './context-menu-provider'
import { EventProvider } from './event-provider'
import { SettingSync } from './setting-sync'
import { StableRouterProvider } from './stable-router-provider'

export const RootProviders: FC<PropsWithChildren> = ({ children }) => (
  <React.Fragment>
    <QueryClientProvider client={queryClient}>
      <Provider store={jotaiStore}>
        <EventProvider />
        <StableRouterProvider />
        <SettingSync />
        <ContextMenuProvider />
        <ModalContainer />
        {children}
      </Provider>
    </QueryClientProvider>
    <Toaster />
  </React.Fragment>
)
