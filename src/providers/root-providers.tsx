import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'jotai'
import { domMax, LazyMotion, MotionConfig } from 'motion/react'
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
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <Provider store={jotaiStore}>
            <EventProvider />
            <StableRouterProvider />
            <SettingSync />
            <ContextMenuProvider />
            <ModalContainer />
            {children}
            <Toaster />
          </Provider>
        </QueryClientProvider>
      </MotionConfig>
    </LazyMotion>
  </React.Fragment>
)
