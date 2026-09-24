import { useEffect, useState } from 'react'
import { api } from '../api'

export default function DoctorApprovalPage() {
  const [doctors, setDoctors] = useState<any[]>([])

  useEffect(() => {
    api.get('/doctors/pending')
      .then((res) => setDoctors(res.data))
      .catch(() => setDoctors([]))
  }, [])

  const handleAction = async (doctorId: string, status: 'APPROVED' | 'REJECTED') => {
    await api.patch(`/doctors/${doctorId}/verify`, { status })
    setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId))
  }

  return (
    <main className="page shell">
      <div className="card">
        <h1>Doctor Verification</h1>
        {doctors.length === 0 ? <p>No pending doctors.</p> : doctors.map((doctor) => (
          <div key={doctor.id} className="card" style={{ marginTop: 16 }}>
            <h3>{doctor.user?.fullName ?? doctor.fullName}</h3>
            <p>Degree: {doctor.degree ?? 'Not provided'}</p>
            <p>Specialization: {doctor.specialization ?? 'Not provided'}</p>
            <p>Experience: {doctor.experienceYears ?? 0} years</p>
            <p>License: {doctor.licenseNumber ?? 'Not provided'}</p>
            <div className="actions">
              <button className="button primary" onClick={() => handleAction(doctor.id, 'APPROVED')}>Approve</button>
              <button className="button secondary" onClick={() => handleAction(doctor.id, 'REJECTED')}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
