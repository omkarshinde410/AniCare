import { useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'

export default function BookAppointmentPage() {
  const { id } = useParams()
  const [form, setForm] = useState({
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    reason: '',
    animalType: 'Cow',
    animalName: '',
    animalAge: '',
    animalGender: 'Male',
    animalSymptoms: '',
    notes: '',
  })
  const [message, setMessage] = useState('')

  const onChange = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const response = await api.post('/appointments', {
        doctorId: id,
        ...form,
      })
      setMessage(`Appointment requested successfully. ID: ${response.data.id}`)
    } catch (error: any) {
      setMessage(error.response?.data?.message ?? 'Unable to request appointment.')
    }
  }

  return (
    <main className="page shell">
      <div className="card form-card">
        <h1>Book Appointment</h1>
        <form className="stack" onSubmit={onSubmit}>
          <label>Date<input type="date" value={form.date} onChange={(e) => onChange('date', e.target.value)} required /></label>
          <label>Start time<input type="time" value={form.startTime} onChange={(e) => onChange('startTime', e.target.value)} required /></label>
          <label>End time<input type="time" value={form.endTime} onChange={(e) => onChange('endTime', e.target.value)} required /></label>
          <label>Reason<textarea value={form.reason} onChange={(e) => onChange('reason', e.target.value)} required /></label>
          <label>Animal type<select value={form.animalType} onChange={(e) => onChange('animalType', e.target.value)}><option>Cow</option><option>Buffalo</option><option>Goat</option><option>Sheep</option><option>Chicken</option><option>Other</option></select></label>
          <label>Animal name/identifier<input value={form.animalName} onChange={(e) => onChange('animalName', e.target.value)} /></label>
          <label>Age<input value={form.animalAge} onChange={(e) => onChange('animalAge', e.target.value)} /></label>
          <label>Gender<select value={form.animalGender} onChange={(e) => onChange('animalGender', e.target.value)}><option>Male</option><option>Female</option><option>Unknown</option></select></label>
          <label>Symptoms<textarea value={form.animalSymptoms} onChange={(e) => onChange('animalSymptoms', e.target.value)} /></label>
          <label>Notes<textarea value={form.notes} onChange={(e) => onChange('notes', e.target.value)} /></label>
          {message && <p className="success">{message}</p>}
          <button className="button primary full-width" type="submit">Send request</button>
        </form>
      </div>
    </main>
  )
}
