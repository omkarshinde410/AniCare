import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
  }, [])

  const pending = appointments.filter((item) => item.status === 'REQUESTED').length
  const approved = appointments.filter((item) => item.status === 'APPROVED').length

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
        <div className="user-chip">Doctor • {user.fullName ?? 'Welcome'}</div>
      </header>

      <section className="card hero compact">
        <h1>Welcome, Dr. {user.fullName ?? 'Doctor'}</h1>
        <p>Verification: ✓ Verified</p>
      </section>

      <section className="grid two-up">
        <div className="card"><h3>Today's Appointments</h3><p>{approved}</p></div>
        <div className="card"><h3>Pending Requests</h3><p>{pending}</p></div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Quick actions</h3>
        <div className="actions">
          <Link className="button primary" to="/doctor/approvals">Review requests</Link>
        </div>
      </section>
    </main>
  )
}
