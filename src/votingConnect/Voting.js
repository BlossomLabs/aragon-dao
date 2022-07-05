import React from 'react'
import { useOrganizationState } from '../providers/OrganizatioProvider'

// This folder will be called just voting as the normal one after the migration to use connect is finished
function Voting() {
  const appState = useOrganizationState()

  return <> Testing </>
}

export default Voting
