import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
  const [appointments, setAppointments] = useState<any[]>([])
  const [profile, setProfile] = useState<any>({})
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
    api.get('/doctors/me')
      .then((res) => setProfile(res.data ?? {}))
      .catch(() => setProfile({}))
  }, [])

  const updateProfile = (field: string, value: string) => {
    setProfile((current: any) => ({ ...current, [field]: value }))
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setProfileMessage('')
    setProfileError('')
    try {
      let locationFields = {}
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
          })
          locationFields = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        } catch {
        }
      }
      const response = await api.post('/doctors/profile', { ...profile, ...locationFields })
      setProfile(response.data)
      setProfileMessage('Profile submitted. An administrator can now review it.')
    } catch (err: any) {
      setProfileError(err.response?.data?.message ?? 'Unable to save your profile.')
    }
  }

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
        <p>Verification: {user.status === 'ACTIVE' ? 'Approved' : 'Pending administrator review'}</p>
      </section>

      {user.status !== 'ACTIVE' && (
        <section className="card" style={{ marginTop: 20 }}>
          <h2>Complete your doctor profile</h2>
          <p>Add your professional details so an administrator can review your application.</p>
          <form onSubmit={saveProfile} className="stack">
            <label>Full name<input value={profile.fullName ?? user.fullName ?? ''} onChange={(e) => updateProfile('fullName', e.target.value)} required /></label>
            <label>Degree<input value={profile.degree ?? ''} onChange={(e) => updateProfile('degree', e.target.value)} /></label>
            <label>University<input value={profile.university ?? ''} onChange={(e) => updateProfile('university', e.target.value)} /></label>
            <label>Specialization<input value={profile.specialization ?? ''} onChange={(e) => updateProfile('specialization', e.target.value)} /></label>
            <label>License number<input value={profile.licenseNumber ?? ''} onChange={(e) => updateProfile('licenseNumber', e.target.value)} /></label>
            <label>Experience in years<input type="number" min="0" value={profile.experienceYears ?? ''} onChange={(e) => updateProfile('experienceYears', e.target.value)} /></label>
            <label>City<input value={profile.city ?? ''} onChange={(e) => updateProfile('city', e.target.value)} /></label>
            <label>Bio<input value={profile.bio ?? ''} onChange={(e) => updateProfile('bio', e.target.value)} /></label>
            {profileMessage && <p className="success">{profileMessage}</p>}
            {profileError && <p className="error">{profileError}</p>}
            <button type="submit" className="button primary">Save profile for review</button>
          </form>
        </section>
      )}

      <section className="grid two-up">
        <div className="card"><h3>Today's Appointments</h3><p>{approved}</p></div>
        <div className="card"><h3>Pending Requests</h3><p>{pending}</p></div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Quick actions</h3>
        <div className="actions">
          {user.status === 'ACTIVE' && <Link className="button primary" to="/doctor/approvals">Review requests</Link>}
          {user.status !== 'ACTIVE' && <p>Your dashboard access is limited until an administrator approves your profile.</p>}
        </div>
      </section>
    </main>
  )
}
