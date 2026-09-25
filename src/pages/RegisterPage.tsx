import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'FARMER' | 'DOCTOR' | 'ADMIN'>('FARMER')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const response = await api.post('/auth/register', { fullName, email, phone, password, role })
      setMessage(response.data.message)
      setError('')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed.')
      setMessage('')
    }
  }

  return (
    <main className="page center">
      <div className="card form-card">
        <h1>Register</h1>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Contact number
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as 'FARMER' | 'DOCTOR' | 'ADMIN')}>
              <option value="FARMER">Farmer</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button primary full-width">Create account</button>
        </form>
      </div>
    </main>
  )
}
