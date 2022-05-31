import React from 'react'
import ReactDOM from 'react-dom'
import { AragonProvider } from './voting/hooks/shared/useAppState'
import App from './voting/App'

ReactDOM.render(
  <AragonProvider>
    <App />
  </AragonProvider>,
  document.getElementById('root')
)
