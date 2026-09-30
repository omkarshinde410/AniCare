import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { api } from '../api'
import VideoCall from '../components/VideoCall'

function isAppointmentInWindow(appointment: any) {
  const start = new Date(`${appointment.date}T${appointment.startTime}`)
  const end = new Date(`${appointment.date}T${appointment.endTime}`)
  const now = new Date()
  return now >= start && now <= end
}

function isAppointmentPast(appointment: any) {
  const end = new Date(`${appointment.date}T${appointment.endTime}`)
  return Number.isFinite(end.getTime()) && new Date() > end
}

function DoctorDocumentForm({ appointment, doctorName }: { appointment: any; doctorName: string }) {
  const [title, setTitle] = useState('Medicine instructions')
  const [content, setContent] = useState('')
  const [signature, setSignature] = useState(doctorName)
  const [medicine, setMedicine] = useState({ name: '', dosage: '', frequency: '', duration: '' })
  const [message, setMessage] = useState('')

  const saveDocument = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await api.post('/documents', {
        appointmentId: appointment.id,
        title,
        content,
        authenticatedBy: doctorName,
        signatureData: signature,
        medicines: medicine.name ? [medicine] : [],
      })
      setMessage('Authorized document created. The farmer can download it now.')
    } catch (error: any) {
      setMessage(error.response?.data?.message ?? 'Unable to create the document.')
    }
  }

  return (
    <form className="document-form stack" onSubmit={saveDocument}>
      <h3>Medicine document</h3>
      <label>Document title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
      <label>Instructions<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write diagnosis and medicine instructions" /></label>
      <label>Medicine name<input value={medicine.name} onChange={(event) => setMedicine({ ...medicine, name: event.target.value })} /></label>
      <label>Dosage<input value={medicine.dosage} onChange={(event) => setMedicine({ ...medicine, dosage: event.target.value })} /></label>
      <label>Frequency<input value={medicine.frequency} onChange={(event) => setMedicine({ ...medicine, frequency: event.target.value })} /></label>
      <label>Duration<input value={medicine.duration} onChange={(event) => setMedicine({ ...medicine, duration: event.target.value })} /></label>
      <label>Signature name<input value={signature} onChange={(event) => setSignature(event.target.value)} required /></label>
      {message && <p className="success">{message}</p>}
      <button className="button primary" type="submit">Authorize document</button>
    </form>
  )
}

function DoctorPaymentForm({ appointment }: { appointment: any }) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('Consultation fee')
  const [message, setMessage] = useState('')
  const requestPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await api.post('/payments/request', { appointmentId: appointment.id, amount, reason })
      setMessage('Fee request sent to the farmer.')
    } catch (error: any) {
      setMessage(error.response?.data?.message ?? 'Unable to request payment.')
    }
  }
  return (
    <form className="payment-form stack" onSubmit={requestPayment}>
      <h3>Request a fee</h3>
      <label>Amount<input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
      <label>Reason<input value={reason} onChange={(event) => setReason(event.target.value)} required /></label>
      {message && <p className="success">{message}</p>}
      <button className="button secondary" type="submit">Send fee request</button>
    </form>
  )
}

function downloadDocument(document: any) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  pdf.setFontSize(18)
  pdf.text(document.title ?? 'AniCare Medical Document', 40, 60)
  pdf.setFontSize(11)
  pdf.text(`Patient: ${document.farmer?.fullName ?? 'Farmer'}`, 40, 95)
  pdf.text(`Doctor: ${document.doctor?.user?.fullName ?? document.authenticatedBy ?? 'Veterinary doctor'}`, 40, 115)
  pdf.text(`Date: ${new Date(document.createdAt).toLocaleDateString()}`, 40, 135)
  const content = document.content ?? document.notes ?? 'Treatment note not provided.'
  const splitText = pdf.splitTextToSize(content, 500)
  pdf.text(splitText, 40, 170)
  let nextY = 190 + splitText.length * 12
  if (document.medicines?.length) {
    pdf.text('Medicines:', 40, nextY)
    nextY += 20
    document.medicines.forEach((medicine: any, index: number) => {
      pdf.text(`${medicine.name} - ${medicine.dosage ?? 'As directed'} - ${medicine.frequency ?? ''} - ${medicine.duration ?? ''}`, 40, nextY + index * 18)
    })
    nextY += document.medicines.length * 18 + 18
  }
  pdf.text(`Authorized by: ${document.authenticatedBy ?? 'Veterinary doctor'}`, 40, nextY)
  pdf.text(`Signature: ${document.signatureData ?? document.authenticatedBy ?? 'Veterinary doctor'}`, 40, nextY + 18)
  pdf.save(`${(document.title ?? 'medical-document').replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [role] = useState(() => JSON.parse(localStorage.getItem('ani-care-user') ?? '{}').role ?? 'FARMER')
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch((error) => {
        setAppointments([])
        setLoadError(error.response?.data?.message ?? 'Unable to load appointments.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
    setBusyId(id)
    setActionError('')
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      const updated = await api.get('/appointments/mine')
      setAppointments(updated.data)
    } catch (error: any) {
      setActionError(error.response?.data?.message ?? 'Unable to update this appointment.')
    } finally {
      setBusyId('')
    }
  }

  const requestAppointments = role === 'DOCTOR' ? appointments.filter((appointment) => appointment.status === 'REQUESTED') : []
  const historyAppointments = role === 'DOCTOR' ? appointments.filter((appointment) => appointment.status !== 'REQUESTED') : appointments
  const now = new Date()
  const isUpcoming = (appointment: any) => ['REQUESTED', 'APPROVED'].includes(appointment.status) && new Date(`${appointment.date}T${appointment.endTime}`) >= now
  const upcomingCount = appointments.filter(isUpcoming).length
  const pastCount = appointments.filter((appointment) => isAppointmentPast(appointment)).length
  const pendingCount = appointments.filter((appointment) => appointment.status === 'REQUESTED').length
  const filteredRequests = requestAppointments.filter((appointment) => filter === 'ALL' || filter === 'REQUESTS' || (filter === 'UPCOMING' && isUpcoming(appointment)))
  const filteredHistory = historyAppointments.filter((appointment) => filter === 'ALL' || filter === 'HISTORY' || (filter === 'UPCOMING' && isUpcoming(appointment)) || (filter === 'PAST' && isAppointmentPast(appointment)))
  const filteredFarmerAppointments = appointments.filter((appointment) => filter === 'ALL' || (filter === 'UPCOMING' && isUpcoming(appointment)) || (filter === 'PAST' && isAppointmentPast(appointment)) || (filter === 'REQUESTED' && appointment.status === 'REQUESTED'))

  const renderAppointment = (appointment: any) => (
    <div key={appointment.id} className={`card appointment-card ${isAppointmentPast(appointment) ? 'appointment-past' : 'appointment-current'}`}>
      <div className="appointment-card-meta">
        <span className={`appointment-state ${appointment.status === 'REQUESTED' ? 'state-requested' : isAppointmentPast(appointment) ? 'state-past' : 'state-current'}`}>
          {appointment.status === 'REQUESTED' ? 'New request' : isAppointmentPast(appointment) ? 'Past appointment' : 'Upcoming / today'}
        </span>
        <span className="appointment-status">{appointment.status}</span>
      </div>
      <h3>
        {role === 'DOCTOR'
          ? `Farmer: ${appointment.farmer?.fullName ?? 'Farmer'}`
          : appointment.doctor?.user?.fullName ?? 'Veterinary doctor'}
      </h3>
      <p>{appointment.date} • {appointment.startTime} - {appointment.endTime}</p>
      <p>Reason: {appointment.reason}</p>
      {role === 'DOCTOR' && <p>Animal: {appointment.animalName ?? appointment.animalType ?? 'Not specified'}</p>}
      {role === 'DOCTOR' && <p>Farmer contact: {appointment.farmer?.phone ? <a href={`tel:${appointment.farmer.phone}`}>{appointment.farmer.phone}</a> : 'Not provided'}</p>}
      {role === 'FARMER' && <p>Doctor contact: {appointment.doctor?.user?.phone ? <a href={`tel:${appointment.doctor.user.phone}`}>{appointment.doctor.user.phone}</a> : 'Not provided'}</p>}

      {role === 'DOCTOR' && appointment.status === 'REQUESTED' && (
        <div className="actions">
          <button className="button primary" disabled={busyId === appointment.id} onClick={() => handleStatus(appointment.id, 'APPROVED')}>{busyId === appointment.id ? 'Updating…' : 'Approve appointment'}</button>
          <button className="button secondary" disabled={busyId === appointment.id} onClick={() => handleStatus(appointment.id, 'REJECTED')}>Decline</button>
        </div>
      )}
      {role === 'FARMER' && appointment.status === 'REQUESTED' && (
        <div className="actions">
          <button className="button secondary" disabled={busyId === appointment.id} onClick={() => handleStatus(appointment.id, 'CANCELLED')}>Cancel request</button>
        </div>
      )}
      {appointment.status === 'APPROVED' && <VideoCall appointmentId={appointment.id} date={appointment.date} startTime={appointment.startTime} endTime={appointment.endTime} />}
      {role === 'FARMER' && appointment.medicalDocument && (
        <div className="document-form">
          <h3>Medicine document ready</h3>
          <p>{appointment.medicalDocument.title}</p>
          <button className="button primary" onClick={() => downloadDocument(appointment.medicalDocument)}>Download PDF</button>
        </div>
      )}
      {role === 'DOCTOR' && appointment.status === 'APPROVED' && isAppointmentInWindow(appointment) && (
        <>
          <DoctorDocumentForm appointment={appointment} doctorName={JSON.parse(localStorage.getItem('ani-care-user') ?? '{}').fullName ?? 'Veterinary doctor'} />
          <DoctorPaymentForm appointment={appointment} />
        </>
      )}
      {role === 'DOCTOR' && appointment.status === 'APPROVED' && !isAppointmentInWindow(appointment) && !appointment.medicalDocument && (
        <p className="muted">Fee and medicine document options are available only during the scheduled appointment.</p>
      )}
      {role === 'FARMER' && appointment.payment?.status === 'PENDING' && (
        <div className="payment-form">
          <h3>Payment requested</h3>
          <p>Amount: {appointment.payment.amount}</p>
          <p>Free payment demo is enabled. You can also contact the doctor using the number above.</p>
          <button className="button primary" onClick={async () => {
            await api.post(`/payments/${appointment.id}/pay`)
            const updated = await api.get('/appointments/mine')
            setAppointments(updated.data)
          }}>Pay using demo</button>
        </div>
      )}
    </div>
  )

  return (
    <main className="page shell">
      <section className="appointments-heading">
        <div><p className="section-kicker">{role === 'DOCTOR' ? 'PRACTICE SCHEDULE' : 'YOUR CARE PLAN'}</p><h1>{role === 'DOCTOR' ? 'Appointments' : 'Visits & requests'}</h1><p>{role === 'DOCTOR' ? 'Review new requests, prepare for visits, and revisit completed care.' : 'Keep track of veterinarian requests, confirmed visits, and past care.'}</p></div>
        {role === 'FARMER' && <Link className="button primary" to="/farmer/doctors">Find a veterinarian</Link>}
      </section>

      <section className={`appointment-overview ${role === 'DOCTOR' ? 'doctor-appointment-overview' : ''}`}>
        <div><span>{role === 'DOCTOR' ? 'New requests' : 'Awaiting confirmation'}</span><strong>{role === 'DOCTOR' ? pendingCount : appointments.filter((item) => item.status === 'REQUESTED').length}</strong></div>
        <div><span>Upcoming visits</span><strong>{upcomingCount}</strong></div>
        <div><span>Past visits</span><strong>{pastCount}</strong></div>
      </section>

      <div className="appointment-toolbar">
        <div className="appointment-filters" role="tablist" aria-label="Filter appointments">
          {(role === 'DOCTOR'
            ? [{ key: 'ALL', label: 'All' }, { key: 'REQUESTS', label: 'Requests' }, { key: 'UPCOMING', label: 'Upcoming' }, { key: 'HISTORY', label: 'History' }]
            : [{ key: 'ALL', label: 'All visits' }, { key: 'UPCOMING', label: 'Upcoming' }, { key: 'REQUESTED', label: 'Pending' }, { key: 'PAST', label: 'Past' }]
          ).map((item) => <button key={item.key} className={filter === item.key ? 'selected' : ''} onClick={() => setFilter(item.key)}>{item.label}</button>)}
        </div>
        <span className="appointment-total">{appointments.length} total</span>
      </div>

      {loadError && <p className="error">{loadError}</p>}
      {actionError && <p className="error">{actionError}</p>}
      {loading ? <div className="loading-row"><span className="call-spinner" />Loading appointments…</div> : appointments.length === 0 ? (
        <div className="appointment-empty"><span aria-hidden="true">◷</span><h2>No appointments yet</h2><p>{role === 'DOCTOR' ? 'Farmer requests will appear here when they book a visit.' : 'Find a veterinarian to request your first visit.'}</p>{role === 'FARMER' && <Link className="button primary" to="/farmer/doctors">Find nearby vets</Link>}</div>
      ) : role === 'DOCTOR' ? (
        <div className="appointment-sections">
          {filteredRequests.length > 0 && <section><div className="section-heading"><div><p className="section-kicker">ACTION NEEDED</p><h2>Requests from farmers <span className="result-count">{filteredRequests.length}</span></h2></div></div><div className="appointment-list">{filteredRequests.map(renderAppointment)}</div></section>}
          {filteredHistory.length > 0 && <section><div className="section-heading"><div><p className="section-kicker">YOUR SCHEDULE</p><h2>{filter === 'HISTORY' || filter === 'PAST' ? 'Past appointments' : 'Confirmed & past visits'}</h2></div></div><div className="appointment-list">{filteredHistory.map(renderAppointment)}</div></section>}
          {filteredRequests.length === 0 && filteredHistory.length === 0 && <div className="appointment-empty"><h2>Nothing in this view</h2><p>Try another appointment filter.</p></div>}
        </div>
      ) : filteredFarmerAppointments.length > 0 ? (
        <div className="appointment-list">{filteredFarmerAppointments.map(renderAppointment)}</div>
      ) : (
        <div className="appointment-empty"><h2>Nothing in this view</h2><p>Try another appointment filter.</p></div>
      )}
    </main>
  )
}
