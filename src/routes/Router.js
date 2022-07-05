import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Voting from '../votingConnect/Voting'

export default function Router() {
  return (
    <Routes>
      <Route exact path="/" element={<Voting />} />
      <Route path="/voting" element={<Voting />} />
    </Routes>
  )
}
