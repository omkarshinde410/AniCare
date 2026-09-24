import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function AdminDashboard() {
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([])
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.get('/doctors/pending'),
      api.get('/admins/pending-admins'),
    ])
      .then(([doctorRes, adminRes]) => {
        setPendingDoctors(doctorRes.data)
        setPendingAdmins(adminRes.data)
      })
      .catch(() => {
        setPendingDoctors([])
        setPendingAdmins([])
      })
  }, [])

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
        <div className="user-chip">Admin Dashboard</div>
      </header>

      <section className="grid two-up">
        <div className="card"><h3>Pending Doctor Verifications</h3><p>{pendingDoctors.length}</p></div>
        <div className="card"><h3>Pending Admin Approvals</h3><p>{pendingAdmins.length}</p></div>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>Management</h3>
        <div className="actions">
          <Link className="button primary" to="/admin/doctor-approvals">Review doctors</Link>
        </div>
      </section>
    </main>
  )
}
