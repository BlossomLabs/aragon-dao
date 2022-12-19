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

  const navigateToAppHome = useCallback(() => {
    if (path.length < 3) {
      return
    }

    navigate(
      `/${path
        .split('/')
        .slice(1, 3)
        .join('/')}`
    )
  }, [path, navigate])

  return [path, navigate, navigateToAppHome]
}
