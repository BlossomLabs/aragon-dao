import React from 'react'
import { useOrganizationState } from '../providers/OrganizatioProvider'

function Voting() {
  const appState = useOrganizationState()

  console.log('appState ', appState)
  console.log('helloooo')
  return <> Hello </>
}

export default Voting
