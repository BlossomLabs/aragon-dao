import { AppRouting } from '@/components/AppRouting'
import React from 'react'

import TokenWrapperApp from '../App'

function TokenWrapperRouter() {
  return (
    <AppRouting
      appName="blossom-token-wrapper"
      appRoutes={[['', TokenWrapperApp]]}
    />
  )
}

export default TokenWrapperRouter
