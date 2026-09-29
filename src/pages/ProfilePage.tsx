import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')

  const handleLogout = () => {
    localStorage.removeItem('ani-care-token')
    localStorage.removeItem('ani-care-user')
    navigate('/login')
  }

  return (
    <main className="page shell">
      <div className="card stack">
        <h1>Profile</h1>
        <p><strong>Name:</strong> {user.fullName ?? 'Farmer'}</p>
        <p><strong>Email:</strong> {user.email ?? 'n/a'}</p>
        <p><strong>Role:</strong> {user.role ?? 'FARMER'}</p>
        <p><strong>Status:</strong> {user.status ?? 'ACTIVE'}</p>

        <button className="button secondary" onClick={handleLogout}>Logout</button>
      </div>
    </main>
  )
}
