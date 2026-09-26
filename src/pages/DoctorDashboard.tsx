import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}')
  const [appointments, setAppointments] = useState<any[]>([])
  const [profile, setProfile] = useState<any>({})
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
    api.get('/doctors/me')
      .then((res) => setProfile(res.data ?? {}))
      .catch(() => setProfile({}))
    api.get('/notifications')
      .then((res) => setUnreadCount(res.data.filter((item: any) => !item.read).length))
      .catch(() => setUnreadCount(0))
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

  const today = new Date().toLocaleDateString('en-CA')
  const pending = appointments.filter((item) => item.status === 'REQUESTED').length
  const todayCount = appointments.filter((item) => item.date === today && item.status === 'APPROVED').length
  const upcoming = appointments.filter((item) => item.status === 'APPROVED' && new Date(`${item.date}T${item.endTime}`) >= new Date()).length

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
        <Link className="user-chip" to="/doctor/documents">Doctor · {user.fullName ?? 'Welcome'}</Link>
      </header>

      <section className="doctor-welcome">
        <div>
          <p className="section-kicker">VETERINARY WORKSPACE</p>
          <h1>Good day, Dr. {user.fullName?.split(' ')[0] ?? 'Doctor'}.</h1>
          <p>Manage today’s consultations, review farmer requests, and prepare care notes in one place.</p>
        </div>
        <div className={`verification-stamp ${user.status === 'ACTIVE' ? 'verified' : 'pending'}`}>
          <span>{user.status === 'ACTIVE' ? '✓' : '…'}</span>
          <small>{user.status === 'ACTIVE' ? 'VERIFIED' : 'IN REVIEW'}</small>
        </div>
      </section>

      {user.status !== 'ACTIVE' && (
        <section className="profile-review-panel">
          <div className="section-heading"><div><p className="section-kicker">GET VERIFIED</p><h2>Complete your professional profile</h2></div><span className="appointment-state state-requested">Review pending</span></div>
          <p>Add your credentials and practice details for the administrator review.</p>
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

      <section className="dashboard-metrics doctor-metrics" aria-label="Practice overview">
        <div><span>Today’s visits</span><strong>{todayCount}</strong><Link to="/doctor/appointments">Open schedule</Link></div>
        <div><span>Farmer requests</span><strong>{pending}</strong><Link to="/doctor/appointments">Review requests</Link></div>
        <div><span>Upcoming visits</span><strong>{upcoming}</strong><Link to="/doctor/appointments">View appointments</Link></div>
        <div><span>Unread updates</span><strong>{unreadCount}</strong><Link to="/doctor/notifications">Open inbox</Link></div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="section-kicker">PRACTICE TOOLS</p><h2>Pick up where you left off</h2></div></div>
        <div className="dashboard-shortcuts doctor-shortcuts">
          <Link to="/doctor/appointments"><span className="shortcut-symbol">↗</span><span><strong>Appointment desk</strong><small>Review requests and visit history</small></span><b>→</b></Link>
          <Link to="/doctor/documents"><span className="shortcut-symbol document-symbol">▤</span><span><strong>Medical documents</strong><small>Prepare and view authorized care notes</small></span><b>→</b></Link>
          <Link to="/doctor/notifications"><span className="shortcut-symbol alert-symbol">•</span><span><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} unread updates` : 'Updates from your appointments'}</small></span><b>→</b></Link>
        </div>
      </section>
    </main>
  )
}
