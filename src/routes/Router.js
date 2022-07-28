import React from 'react'
import { Route, Routes } from 'react-router-dom'

import VotingApp from '../voting/App'

export default function Router() {
  return (
    <Routes>
      <Route exact path="/" element={<VotingApp />} />
      <Route path="/voting" element={<VotingApp />} />
    </Routes>
  )
}
