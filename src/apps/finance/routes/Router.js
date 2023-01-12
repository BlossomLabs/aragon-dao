import { AppRouting } from '@/components/AppRouting'
import React from 'react'

import FinanceApp from '../App'

function FinanceRouter() {
  return <AppRouting appName="finance" appRoutes={[['', FinanceApp]]} />
}

export default FinanceRouter
