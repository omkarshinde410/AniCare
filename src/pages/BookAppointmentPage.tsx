import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

export default function BookAppointmentPage() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
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
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.get(`/doctors/${id}`).then((response) => setDoctor(response.data)).catch(() => setDoctor(null))
  }, [id])

  const onChange = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (form.date < new Date().toLocaleDateString('en-CA')) {
      setError('Choose today or a future date for the appointment.')
      return
    }
    if (form.endTime <= form.startTime) {
      setError('End time must be later than the start time.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/appointments', {
        doctorId: id,
        ...form,
      })
      setMessage('Request sent. The veterinarian will review your appointment.')
    } catch (error: any) {
      setError(error.response?.data?.message ?? 'Unable to request appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page shell">
      <header className="booking-heading">
        <Link className="back-link" to={id ? `/farmer/doctors/${id}` : '/farmer/doctors'}>← Back to veterinarian</Link>
        <p className="section-kicker">APPOINTMENT REQUEST</p>
        <h1>Tell us what your animal needs.</h1>
        <p>Choose a time and share a few details. Your request goes to the veterinarian for confirmation.</p>
      </header>

      <div className="booking-layout">
        <form className="booking-form" onSubmit={onSubmit}>
          <section className="booking-section">
            <div className="booking-section-heading"><span>01</span><div><h2>Visit time</h2><p>Select a convenient date and time.</p></div></div>
            <div className="booking-fields two-fields">
              <label>Date<input type="date" min={new Date().toLocaleDateString('en-CA')} value={form.date} onChange={(e) => onChange('date', e.target.value)} required /></label>
              <label>Starts at<input type="time" value={form.startTime} onChange={(e) => onChange('startTime', e.target.value)} required /></label>
              <label>Ends at<input type="time" value={form.endTime} onChange={(e) => onChange('endTime', e.target.value)} required /></label>
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section-heading"><span>02</span><div><h2>Animal details</h2><p>Help the vet prepare for the visit.</p></div></div>
            <div className="booking-fields two-fields">
              <label>Animal type<select value={form.animalType} onChange={(e) => onChange('animalType', e.target.value)}><option>Cow</option><option>Buffalo</option><option>Goat</option><option>Sheep</option><option>Chicken</option><option>Other</option></select></label>
              <label>Name or identifier<input value={form.animalName} onChange={(e) => onChange('animalName', e.target.value)} placeholder="Optional" /></label>
              <label>Age<input value={form.animalAge} onChange={(e) => onChange('animalAge', e.target.value)} placeholder="e.g. 3 years" /></label>
              <label>Gender<select value={form.animalGender} onChange={(e) => onChange('animalGender', e.target.value)}><option>Male</option><option>Female</option><option>Unknown</option></select></label>
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section-heading"><span>03</span><div><h2>What is happening?</h2><p>Describe the concern so the vet has context.</p></div></div>
            <div className="booking-fields">
              <label>Reason for visit<textarea value={form.reason} onChange={(e) => onChange('reason', e.target.value)} placeholder="What do you need help with?" required /></label>
              <label>Symptoms<textarea value={form.animalSymptoms} onChange={(e) => onChange('animalSymptoms', e.target.value)} placeholder="When did it start? What have you noticed?" /></label>
              <label>Additional notes<textarea value={form.notes} onChange={(e) => onChange('notes', e.target.value)} placeholder="Anything else the veterinarian should know?" /></label>
            </div>
          </section>
          {error && <p className="error booking-feedback">{error}</p>}
          {message && <p className="success booking-feedback">{message}</p>}
          <button className="button primary booking-submit" type="submit" disabled={submitting}>{submitting ? 'Sending request…' : 'Send appointment request'}</button>
        </form>

        <aside className="booking-aside">
          <p className="section-kicker">REQUESTING WITH</p>
          <div className="booking-doctor-avatar">{(doctor?.fullName ?? doctor?.user?.fullName ?? 'V').split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
          <h2>{doctor?.user?.fullName ?? doctor?.fullName ?? 'Veterinarian'}</h2>
          <p>{doctor?.specialization ?? 'Veterinary doctor'}</p>
          <div className="booking-doctor-facts"><span>{doctor?.degree ?? 'Verified practice'}</span><span>★ {doctor?.rating ?? 0} rating</span><span>{doctor?.city ?? 'Location available on profile'}</span></div>
          <div className="booking-note"><strong>What happens next?</strong><p>Your request stays pending until the veterinarian approves it. You’ll get an update in your notifications.</p></div>
        </aside>
      </div>
    </main>
  )
}
