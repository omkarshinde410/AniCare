import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

export default function DoctorProfilePage() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    api.get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data))
      .catch(() => setDoctor(null))
  }, [id])

  if (!doctor) {
    return (
      <main className="page shell">
        <div className="card"><h1>Doctor Profile</h1><p>Loading doctor details...</p></div>
      </main>
    )
  }

  return (
    <main className="page shell">
      <div className="card stack">
        <h1>{doctor.user?.fullName ?? doctor.fullName}</h1>
        <p className="pill">{doctor.verificationStatus === 'APPROVED' ? 'Verified Veterinary Doctor' : doctor.verificationStatus}</p>
        <p><strong>Degree:</strong> {doctor.degree ?? 'Not provided'}</p>
        <p><strong>Specialization:</strong> {doctor.specialization ?? 'General veterinary practice'}</p>
        <p><strong>Experience:</strong> {doctor.experienceYears ?? 0} years</p>
        <p><strong>Location:</strong> {doctor.city ?? 'Not provided'}, {doctor.state ?? ''}</p>
        <p><strong>Rating:</strong> {doctor.rating ?? 4.5} ★</p>
        <p><strong>Bio:</strong> {doctor.bio ?? 'Focused on livestock health, disease prevention, and farm animal support.'}</p>

        <div className="actions">
          <Link className="button primary" to={`/farmer/doctors/${id}/book`}>Request Appointment</Link>
          <Link className="button secondary" to="/farmer/doctors">Back to doctors</Link>
        </div>
      </div>
    </main>
  )
}
