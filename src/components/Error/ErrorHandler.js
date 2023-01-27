import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorScreen from './ErrorScreen'
import GenericError from './GenericError'

function ErrorFallback({ error }) {
  const title = error.message
  const content = error.stack.replace(/^\n+|\n+$/g, '').replace(/^ {4}/gm, '')

  return (
    <ErrorScreen>
      <GenericError detailsTitle={title} detailsContent={content} />
    </ErrorScreen>
  )
}

export function ErrorHandler({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload(true)}
    >
      {children}
    </ErrorBoundary>
  )
}
