import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function FarmerDashboard() {
  const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
  const [appointments, setAppointments] = useState<any[]>([])
  const [alertsCount, setAlertsCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
    api.get('/farmers/me')
      .then((res) => {
        const profile = res.data
        if (profile?.latitude != null && profile?.longitude != null) {
          return api.get('/disease-alerts/nearby', { params: { latitude: profile.latitude, longitude: profile.longitude } })
        }
        return null
      })
      .then((res) => { if (res) setAlertsCount(res.data.length) })
      .catch(() => setAlertsCount(0))
    api.get('/notifications')
      .then((res) => setUnreadCount(res.data.filter((item: any) => !item.read).length))
      .catch(() => setUnreadCount(0))
  }, [])

  const now = new Date()
  const nextAppointment = appointments
    .filter((item) => item.status === 'APPROVED' || item.status === 'REQUESTED')
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())
    .find((item) => new Date(`${item.date}T${item.endTime}`) >= now)
  const activeCount = appointments.filter((item) => ['REQUESTED', 'APPROVED'].includes(item.status)).length

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
        <Link className="user-chip" to="/farmer/profile">Farmer · {user.fullName ?? 'Welcome'}</Link>
      </header>

      <section className="farmer-welcome">
        <div>
          <p className="section-kicker">FARMER SPACE</p>
          <h1>Good care starts nearby.</h1>
          <p>Find a verified veterinarian, keep track of visits, and stay ahead of local health alerts.</p>
          <div className="actions">
            <Link className="button primary" to="/farmer/doctors"><span aria-hidden="true">⌖</span> Find a veterinarian</Link>
            <Link className="button secondary" to="/farmer/appointments">View appointments</Link>
          </div>
        </div>
        <div className="welcome-mark" aria-hidden="true"><span>AC</span><small>ANIMAL CARE<br />NEAR YOU</small></div>
      </section>

      <section className="dashboard-metrics" aria-label="Your AniCare overview">
        <div><span>Active appointments</span><strong>{activeCount}</strong><Link to="/farmer/appointments">See schedule</Link></div>
        <div><span>Nearby alerts</span><strong>{alertsCount}</strong><Link to="/farmer/alerts">Review alerts</Link></div>
        <div><span>Unread updates</span><strong>{unreadCount}</strong><Link to="/farmer/notifications">Open inbox</Link></div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div><p className="section-kicker">YOUR SCHEDULE</p><h2>Next appointment</h2></div>
          <Link to="/farmer/appointments">All appointments</Link>
        </div>
        {nextAppointment ? (
          <article className="next-appointment-row">
            <div className="appointment-date-block"><strong>{new Date(`${nextAppointment.date}T12:00:00`).toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>{new Date(`${nextAppointment.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span></div>
            <div className="appointment-main"><strong>{nextAppointment.doctor?.user?.fullName ?? 'Veterinary doctor'}</strong><span>{nextAppointment.date} · {nextAppointment.startTime}–{nextAppointment.endTime}</span></div>
            <span className={`appointment-state ${nextAppointment.status === 'REQUESTED' ? 'state-requested' : 'state-current'}`}>{nextAppointment.status}</span>
          </article>
        ) : (
          <div className="empty-row"><div><strong>No upcoming visits</strong><p>When you book a vet, appointment details will show here.</p></div><Link className="text-action" to="/farmer/doctors">Find a vet →</Link></div>
        )}
      </section>

      <section className="dashboard-shortcuts">
        <Link to="/farmer/doctors"><span className="shortcut-symbol">⌖</span><span><strong>Find a veterinarian</strong><small>Browse verified local care</small></span><b>→</b></Link>
        <Link to="/farmer/alerts"><span className="shortcut-symbol alert-symbol">!</span><span><strong>Local health alerts</strong><small>{alertsCount ? `${alertsCount} active near your location` : 'Check reports in your area'}</small></span><b>→</b></Link>
        <Link to="/farmer/documents"><span className="shortcut-symbol document-symbol">▤</span><span><strong>Medical documents</strong><small>Prescriptions and care notes</small></span><b>→</b></Link>
      </section>
    </main>
  )
}
