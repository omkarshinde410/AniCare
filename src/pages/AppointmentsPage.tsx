import { useEffect, useState } from 'react'
import { api } from '../api'
import VideoCall from '../components/VideoCall'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [role, setRole] = useState('FARMER')
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
    setRole(user.role ?? 'FARMER')

    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
    api.get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => setNotifications([]))
  }, [])

  const handleStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
    await api.patch(`/appointments/${id}/status`, { status })
    const updated = await api.get('/appointments/mine')
    setAppointments(updated.data)
  }

  return (
    <main className="page shell">
      <div className="card">
        <h1>My Appointments</h1>
        {notifications.filter((notification) => !notification.read).slice(0, 3).map((notification) => (
          <div key={notification.id} className="notification-banner">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
        ))}
        {appointments.length === 0 ? (
          <p>No appointments yet.</p>
        ) : (
          <div className="stack" style={{ marginTop: 18 }}>
            {appointments.map((appointment) => (
              <div key={appointment.id} className="card" style={{ padding: 16 }}>
                <h3>
                  {role === 'DOCTOR'
                    ? `Farmer: ${appointment.farmer?.fullName ?? 'Farmer'}`
                    : appointment.doctor?.user?.fullName ?? 'Veterinary doctor'}
                </h3>
                <p>{appointment.date} • {appointment.startTime} - {appointment.endTime}</p>
                <p>Reason: {appointment.reason}</p>
                {role === 'DOCTOR' && <p>Animal: {appointment.animalName ?? appointment.animalType ?? 'Not specified'}</p>}
                <p>Status: {appointment.status}</p>
                {role === 'DOCTOR' && <p>Farmer contact: {appointment.farmer?.phone ? <a href={`tel:${appointment.farmer.phone}`}>{appointment.farmer.phone}</a> : 'Not provided'}</p>}
                {role === 'FARMER' && <p>Doctor contact: {appointment.doctor?.user?.phone ? <a href={`tel:${appointment.doctor.user.phone}`}>{appointment.doctor.user.phone}</a> : 'Not provided'}</p>}

                {role === 'DOCTOR' && appointment.status === 'REQUESTED' && (
                  <div className="actions">
                    <button className="button primary" onClick={() => handleStatus(appointment.id, 'APPROVED')}>Approve</button>
                    <button className="button secondary" onClick={() => handleStatus(appointment.id, 'REJECTED')}>Reject</button>
                  </div>
                )}

                {role === 'FARMER' && appointment.status === 'REQUESTED' && (
                  <div className="actions">
                    <button className="button secondary" onClick={() => handleStatus(appointment.id, 'CANCELLED')}>Cancel</button>
                  </div>
                )}

                {appointment.status === 'APPROVED' && <VideoCall appointmentId={appointment.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
