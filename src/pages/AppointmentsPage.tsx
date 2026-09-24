import { useEffect, useState } from 'react'
import { api } from '../api'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [role, setRole] = useState('FARMER')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
    setRole(user.role ?? 'FARMER')

    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
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
        {appointments.length === 0 ? (
          <p>No appointments yet.</p>
        ) : (
          <div className="stack" style={{ marginTop: 18 }}>
            {appointments.map((appointment) => (
              <div key={appointment.id} className="card" style={{ padding: 16 }}>
                <h3>{appointment.doctor?.user?.fullName ?? 'Veterinary doctor'}</h3>
                <p>{appointment.date} • {appointment.startTime} - {appointment.endTime}</p>
                <p>Reason: {appointment.reason}</p>
                <p>Status: {appointment.status}</p>

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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
