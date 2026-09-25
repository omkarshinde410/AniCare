import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { api } from '../api'
import VideoCall from '../components/VideoCall'

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
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    api.get('/appointments/mine')
      .then((res) => setAppointments(res.data))
      .catch((error) => {
        setAppointments([])
        setLoadError(error.response?.data?.message ?? 'Unable to load appointments.')
      })
    api.get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => setNotifications([]))
  }, [])

  const handleStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
    await api.patch(`/appointments/${id}/status`, { status })
    const updated = await api.get('/appointments/mine')
    setAppointments(updated.data)
  }

  const requestAppointments = role === 'DOCTOR' ? appointments.filter((appointment) => appointment.status === 'REQUESTED') : []
  const historyAppointments = role === 'DOCTOR' ? appointments.filter((appointment) => appointment.status !== 'REQUESTED') : appointments

  const renderAppointment = (appointment: any) => (
    <div key={appointment.id} className="card" style={{ padding: 16 }}>
      <h3>
        {role === 'DOCTOR'
          ? `Farmer: ${appointment.farmer?.fullName ?? 'Farmer'}`
          : appointment.doctor?.user?.fullName ?? 'Veterinary doctor'}
      </h3>
      <p>{appointment.date} • {appointment.startTime} - {appointment.endTime}</p>
      <p>Reason: {appointment.reason}</p>
      {role === 'DOCTOR' && <p>Animal: {appointment.animalName ?? appointment.animalType ?? 'Not specified'}</p>}
      <p>Status: {appointment.status}</p>
      {role === 'DOCTOR' && <p>Farmer contact: {appointment.farmer?.phone ? <a href={`tel:${appointment.farmer.phone}`}>{appointment.farmer.phone}</a> : 'Not provided'}</p>}
      {role === 'FARMER' && <p>Doctor contact: {appointment.doctor?.user?.phone ? <a href={`tel:${appointment.doctor.user.phone}`}>{appointment.doctor.user.phone}</a> : 'Not provided'}</p>}

      {role === 'DOCTOR' && appointment.status === 'REQUESTED' && (
        <div className="actions">
          <button className="button primary" onClick={() => handleStatus(appointment.id, 'APPROVED')}>Approve</button>
          <button className="button secondary" onClick={() => handleStatus(appointment.id, 'REJECTED')}>Reject</button>
        </div>
      )}
      {role === 'FARMER' && appointment.status === 'REQUESTED' && (
        <div className="actions">
          <button className="button secondary" onClick={() => handleStatus(appointment.id, 'CANCELLED')}>Cancel</button>
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
      {role === 'DOCTOR' && appointment.status === 'APPROVED' && (
        <>
          <DoctorDocumentForm appointment={appointment} doctorName={JSON.parse(localStorage.getItem('ani-care-user') ?? '{}').fullName ?? 'Veterinary doctor'} />
          <DoctorPaymentForm appointment={appointment} />
        </>
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
      <div className="card">
        <h1>{role === 'DOCTOR' ? 'Appointment requests and history' : 'My Appointments'}</h1>
        {loadError && <p className="error">{loadError}</p>}
        {notifications.filter((notification) => !notification.read).slice(0, 3).map((notification) => (
          <div key={notification.id} className="notification-banner">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
        ))}
        {appointments.length === 0 ? (
          <p>No appointments yet.</p>
        ) : (
          <div className="stack" style={{ marginTop: 18 }}>
            {role === 'DOCTOR' && requestAppointments.length > 0 && <h2>Requests from farmers</h2>}
            {requestAppointments.map(renderAppointment)}
            {role === 'DOCTOR' && historyAppointments.length > 0 && <h2>Appointment history</h2>}
            {historyAppointments.map(renderAppointment)}
          </div>
        )}
      </div>
    </main>
  )
}
