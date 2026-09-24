import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('ani-care-token', response.data.token)
      localStorage.setItem('ani-care-user', JSON.stringify(response.data.user))
      const role = response.data.user.role
      if (role === 'FARMER') navigate('/farmer')
      else if (role === 'DOCTOR') navigate('/doctor')
      else navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed. Please try again.')
    }
  }

  return (
    <main className="page center">
      <div className="card form-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button primary full-width">Login</button>
        </form>
      </div>
    </main>
  )
}
