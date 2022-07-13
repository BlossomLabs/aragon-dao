import React from 'react'
import { Route, Routes } from 'react-router-dom'

import App from '../votingConnect/App'
import LegacyVoting from '../voting/App'

export default function Router() {
  return (
    <Routes>
      <Route exact path="/" element={<App />} />
      <Route path="/voting" element={<App />} />
      <Route path="/legacy" element={<LegacyVoting />} />
    </Routes>
  )
}
