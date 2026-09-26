import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
  const initials = (user.fullName ?? 'Farmer').split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase()

  const handleLogout = () => {
    localStorage.removeItem('ani-care-token')
    localStorage.removeItem('ani-care-user')
    navigate('/login')
  }

  return (
    <main className="page shell">
      <section className="profile-heading"><p className="section-kicker">ACCOUNT</p><h1>Your profile</h1><p>Account details and sign-in controls.</p></section>
      <section className="profile-identity">
        <div className="profile-avatar">{initials}</div>
        <div><span className="section-kicker">{user.role ?? 'FARMER'} ACCOUNT</span><h2>{user.fullName ?? 'Farmer'}</h2><p>{user.status === 'ACTIVE' ? 'Active account' : 'Account review pending'}</p></div>
        <span className={`account-status ${user.status === 'ACTIVE' ? 'account-active' : 'account-pending'}`}>{user.status ?? 'ACTIVE'}</span>
      </section>
      <section className="profile-details">
        <div className="section-heading"><div><p className="section-kicker">PERSONAL DETAILS</p><h2>Account information</h2></div></div>
        <dl>
          <div><dt>Full name</dt><dd>{user.fullName ?? 'Not provided'}</dd></div>
          <div><dt>Email address</dt><dd>{user.email ?? 'Not provided'}</dd></div>
          <div><dt>Contact number</dt><dd>{user.phone ?? 'Not provided'}</dd></div>
          <div><dt>Role</dt><dd>{user.role ?? 'FARMER'}</dd></div>
        </dl>
      </section>
      <section className="profile-actions">
        <Link to="/farmer/notifications"><span><strong>Notifications</strong><small>Review appointment and care updates</small></span><b>→</b></Link>
        <button className="logout-button" onClick={handleLogout}><span><strong>Sign out</strong><small>End this session on this device</small></span><b>↗</b></button>
      </section>
    </main>
  )
}
