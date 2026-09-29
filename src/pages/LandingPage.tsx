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

      <section className="hero compact card">
        <div>
          <h1>AniCare</h1>
          <p>Connect with veterinarians and manage animal care appointments.</p>
          <div className="actions">
            <Link className="button primary" to="/register">Create account</Link>
            <Link className="button secondary" to="/login">Login</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
