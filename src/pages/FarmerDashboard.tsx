import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function FarmerDashboard() {
  const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
  }, [])

  const nextAppointment = appointments.find((item) => item.status !== 'CANCELLED') ?? appointments[0]

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
        <div className="user-chip">Farmer • {user.fullName ?? 'Welcome'}</div>
      </header>

      <section className="card hero compact">
        <h1>Find Veterinary Doctor Near Me</h1>
        <Link className="button primary" to="/farmer/doctors">📍 Find Nearby Doctors</Link>
      </section>

      <section className="grid two-up">
        <div className="card">
          <h3>Upcoming Appointment</h3>
          {nextAppointment ? (
            <>
              <p><strong>{nextAppointment.doctor?.user?.fullName ?? 'Veterinary doctor'}</strong></p>
              <p>{nextAppointment.date} • {nextAppointment.startTime} to {nextAppointment.endTime}</p>
              <p>Status: {nextAppointment.status}</p>
            </>
          ) : (
            <p>No upcoming appointment yet.</p>
          )}
        </div>
        <div className="card">
          <h3>Disease Alerts Nearby</h3>
          <Link to="/farmer/alerts">View alerts</Link>
        </div>
      </section>

      <nav className="bottom-nav">
        <Link to="/farmer">Home</Link>
        <Link to="/farmer/doctors">Doctors</Link>
        <Link to="/farmer/appointments">Appointments</Link>
        <Link to="/farmer/alerts">Alerts</Link>
        <Link to="/farmer/documents">Documents</Link>
        <Link to="/farmer/profile">Profile</Link>
      </nav>
    </main>
  )
}
