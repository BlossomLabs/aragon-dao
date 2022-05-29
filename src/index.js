import React from 'react'
import ReactDOM from 'react-dom'
import { AragonProvider } from './hooks/shared/useAppState'
import App from './App'

ReactDOM.render(
  <AragonProvider>
    <App />
  </AragonProvider>,
  document.getElementById('root')
)
