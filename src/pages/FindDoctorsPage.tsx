import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const lat = 20.5937
    const lng = 78.9629
    api.get('/doctors/nearby', { params: { lat, lng, radius: 200, search } })
      .then((res) => setDoctors(res.data))
      .catch(() => setDoctors([]))
  }, [search])

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
      </header>

      <section className="card">
        <h1>Find Doctors</h1>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialization" />
      </section>

      <section className="stack">
        {doctors.length === 0 ? <div className="card empty-state">No nearby veterinary doctors found.</div> : doctors.map((doctor) => (
          <div key={doctor.id} className="card doctor-card">
            <div className="doctor-header">
              <div>
                <h3>{doctor.fullName}</h3>
                <p>{doctor.degree ?? 'Veterinary Doctor'}</p>
              </div>
              <span className="badge">Verified</span>
            </div>
            <p>{doctor.specialization ?? 'General practice'}</p>
            <p>Rating: {doctor.rating ?? 4.5} ★</p>
            <p>{doctor.distance ? `${doctor.distance.toFixed(1)} km away` : 'Near you'}</p>
            <Link className="button primary" to={`/farmer/doctors/${doctor.id}`}>View Profile</Link>
          </div>
        ))}
      </section>
    </main>
  )
}
