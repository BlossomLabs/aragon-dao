import { useLocation, useHistory } from 'react-router-dom'
export default function usePath() {
  const location = useLocation()
  const history = useHistory()
  return [location.pathname, path => history.push(path)]
}
