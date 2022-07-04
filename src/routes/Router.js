import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Voting from '../votingConnect/Voting'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Voting />} />
      <Route path="/home" element={<Voting />} />
    </Routes>
  )
}
