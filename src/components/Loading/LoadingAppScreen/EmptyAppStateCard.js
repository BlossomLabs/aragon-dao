import { EmptyStateCard, GU, LoadingRing } from '@aragon/ui'
import React from 'react'

function EmptyAppStateCard({
  emptyStateLabel = 'No data found',
  isLoading,
  action,
  ...props
}) {
  const actionProp = action ? { action } : {}
  return (
    <EmptyStateCard
      text={
        isLoading ? (
          <div
            css={`
              display: grid;
              align-items: center;
              justify-content: center;
              grid-template-columns: auto auto;
              grid-gap: ${1 * GU}px;
            `}
          >
            <LoadingRing mode="half-circle" />
            <span>Loading…</span>
          </div>
        ) : (
          <span>{emptyStateLabel}</span>
        )
      }
      {...props}
      {...(isLoading ? {} : actionProp)}
    />
  )
}

export default EmptyAppStateCard
