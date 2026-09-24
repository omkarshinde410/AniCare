import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
        <nav className="nav">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero card">
        <div>
          <span className="pill">Veterinary care for every farmer</span>
          <h1>Find trusted veterinary care near you.</h1>
          <p>
            Connect with verified vets, schedule appointments, view alerts, and manage medicine instructions from a mobile-first platform built for rural animal care.
          </p>
          <div className="actions">
            <Link className="button primary" to="/register">Create account</Link>
            <Link className="button secondary" to="/login">Login</Link>
          </div>
        </div>
        <div className="stat-panel">
          <div className="mini-card"><strong>3K+</strong><span>Farmers helped</span></div>
          <div className="mini-card"><strong>250+</strong><span>Approved vets</span></div>
          <div className="mini-card"><strong>24/7</strong><span>Alerts & support</span></div>
        </div>
      </section>

      <section className="grid three-up">
        <div className="card feature">
          <h3>Find nearby vets</h3>
          <p>Use phone location and specialized filters to locate the right veterinary doctor.</p>
        </div>
        <div className="card feature">
          <h3>Approve appointments</h3>
          <p>Farmers request visits, doctors approve or reject, and contact becomes available only after approval.</p>
        </div>
        <div className="card feature">
          <h3>Medical documents</h3>
          <p>Doctors generate authenticated treatment PDFs with medicines, dosage, and signature notes.</p>
        </div>
      </section>
    </main>
  )
}
