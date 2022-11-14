import React, { useCallback } from 'react'
import { Main, Tag, Header, SyncIndicator, GU } from '@aragon/ui'

import { IdentityProvider } from './identity-manager'
import { useGuiStyle } from './hooks/shared'
import useSelectedDelay from './hooks/useSelectedDelay'
import useFilterDelays from './hooks/useFilterDelays'

import Title from './components/Title'
import NoDelays from './screens/NoDelays'
import DelayDetail from './screens/DelayDetail'
import Delays from './screens/Delays'
import { ANDelayProvider, useAppState } from './providers/ANDelayProvider'
import { formatTime } from './lib/math-utils'

const App = React.memo(() => {
  const {
    delayedScripts,
    executionTargets,
    executionDelay,
    // onDelayAction,
    loading,
  } = useAppState()
  const [selectedDelay, selectDelay] = useSelectedDelay(delayedScripts)

  const {
    filteredDelays,
    delayStatusFilter,
    handleDelayStatusFilterChange,
    delayAppFilter,
    handleDelayAppFilterChange,
    handleClearFilters,
  } = useFilterDelays(delayedScripts, executionTargets)

  const { appearance } = useGuiStyle()

  const handleBack = useCallback(() => {
    selectDelay(-1)
  }, [selectDelay])

  return (
    <Main theme={appearance}>
      <SyncIndicator visible={loading} />
      {!delayedScripts.length && (
        <div
          css={`
            height: calc(100vh - ${8 * GU}px);
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <NoDelays isSyncing={loading} />
        </div>
      )}
      {!!delayedScripts.length && (
        <React.Fragment>
          <Header
            primary={
              <Title
                text="Delay"
                after={
                  executionDelay && (
                    <Tag mode="identifier" uppercase={false}>
                      {formatTime(executionDelay)}
                    </Tag>
                  )
                }
              />
            }
          />
          {selectedDelay ? (
            <DelayDetail
              delay={selectedDelay}
              onBack={handleBack}
              onDelayAction={() => console.log('delay')}
            />
          ) : (
            <Delays
              delays={delayedScripts}
              filteredDelays={filteredDelays}
              delayStatusFilter={delayStatusFilter}
              handleDelayStatusFilterChange={handleDelayStatusFilterChange}
              delayAppFilter={delayAppFilter}
              handleDelayAppFilterChange={handleDelayAppFilterChange}
              handleClearFilters={handleClearFilters}
              executionTargets={executionTargets}
              selectDelay={selectDelay}
            />
          )}
        </React.Fragment>
      )}
    </Main>
  )
})

export default function Delay() {
  return (
    <IdentityProvider>
      <ANDelayProvider>
        <App />
      </ANDelayProvider>
    </IdentityProvider>
  )
}
