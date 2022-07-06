import React from 'react'
import { useOrganizationState } from '../providers/OrganizationProvider'

// This folder will be called just voting as the normal one after the migration to use connect is finished
function Voting() {
  const appState = useOrganizationState()

  console.log('appState ', appState)

  return <> Testing </>
}

export default Voting
