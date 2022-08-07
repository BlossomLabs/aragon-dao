import { useLocation, useHistory } from 'react-router-dom'
export default function usePath() {
  const location = useLocation()
  const navigate = useHistory()
  return [location.pathname, path => navigate(path)]
}
