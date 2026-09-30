import { useNavigate } from 'react-router-dom'
import { Localized } from '../Language'

export default function LogoutButton() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('ani-care-token')
    localStorage.removeItem('ani-care-user')
    navigate('/login', { replace: true })
  }

  return <Localized><button type="button" className="button secondary logout-action" onClick={logout}>Sign out</button></Localized>
}