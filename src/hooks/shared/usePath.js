import { useLocation, useNavigate } from 'react-router-dom'
export default function usePath() {
  const location = useLocation()
  const navigate = useNavigate()
  return [location.pathname, path => navigate(path)]
}
