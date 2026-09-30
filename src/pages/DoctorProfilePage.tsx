import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

export default function DoctorProfilePage() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data))
      .catch(() => { setDoctor(null); setError('Unable to load this veterinarian profile.') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="page shell">
        <div className="loading-row"><span className="call-spinner" />Loading veterinarian profile…</div>
      </main>
    )
  }

  if (!doctor) return <main className="page shell"><div className="alert-empty"><h2>Profile unavailable</h2><p>{error || 'This veterinarian profile could not be found.'}</p><Link className="button secondary" to="/farmer/doctors">Back to doctors</Link></div></main>

  return (
    <main className="page shell">
      <Link className="back-link" to="/farmer/doctors">← All veterinarians</Link>
      <section className="vet-profile-hero">
        <div className="vet-profile-avatar">{(doctor.user?.fullName ?? doctor.fullName).split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
        <div className="vet-profile-main">
          <span className="verified-line">✓ VERIFIED VETERINARIAN</span>
          <h1>{doctor.user?.fullName ?? doctor.fullName}</h1>
          <p>{doctor.specialization ?? 'General veterinary practice'}</p>
          <span className="vet-location">⌖ {[doctor.city, doctor.state].filter(Boolean).join(', ') || 'Location not provided'}</span>
        </div>
        <div className="vet-rating"><strong>{doctor.rating ?? 0}</strong><span>★</span><small>{doctor.reviewCount ?? 0} reviews</small></div>
      </section>
      <section className="vet-profile-layout">
        <div className="vet-profile-details">
          <section><p className="section-kicker">ABOUT THE VETERINARIAN</p><p>{doctor.bio ?? 'Focused on livestock health, disease prevention, and practical animal care.'}</p></section>
          <section><p className="section-kicker">QUALIFICATIONS & EXPERIENCE</p><dl><div><dt>Degree</dt><dd>{doctor.degree ?? 'Not provided'}</dd></div><div><dt>University</dt><dd>{doctor.university ?? 'Not provided'}</dd></div><div><dt>Experience</dt><dd>{doctor.experienceYears ?? 0} years</dd></div><div><dt>Specialization</dt><dd>{doctor.specialization ?? 'General practice'}</dd></div></dl></section>
        </div>
        <aside className="vet-booking-panel"><p className="section-kicker">NEED A CONSULTATION?</p><h2>Request an appointment</h2><p>Choose a time and describe what your animal needs. The veterinarian will confirm your request.</p><Link className="button primary full-width" to={`/farmer/doctors/${id}/book`}>Continue to booking</Link></aside>
      </section>
    </main>
  )
}
