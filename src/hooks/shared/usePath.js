import { useCallback } from 'react'
import { useLocation, useHistory } from 'react-router-dom'

export default function usePath() {
  const location = useLocation()
  const history = useHistory()
  const path = location.pathname

  const navigate = useCallback(
    path => {
      history.push(path)
    },
    [history]
  )

  return [path, navigate]
}
