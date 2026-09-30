import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { api } from '../api'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const role = JSON.parse(localStorage.getItem('ani-care-user') ?? '{}').role ?? 'FARMER'

  useEffect(() => {
    api.get('/documents/my')
      .then((res) => setDocuments(res.data))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = (document: any) => {
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

    if (Array.isArray(document.medicines) && document.medicines.length > 0) {
      pdf.text('Medicines:', 40, nextY)
      nextY += 20
      document.medicines.forEach((medicine: any, index: number) => {
        const offset = nextY + index * 18
        pdf.text(`• ${medicine.name} - ${medicine.dosage ?? 'As directed'} - ${medicine.frequency ?? ''}`, 40, offset)
      })
      nextY += document.medicines.length * 18 + 18
    }

    pdf.text(`Authorized by: ${document.authenticatedBy ?? 'Veterinary doctor'}`, 40, nextY)
    pdf.text(`Signature: ${document.signatureData ?? document.authenticatedBy ?? 'Veterinary doctor'}`, 40, nextY + 18)

    pdf.save(`${(document.title ?? 'medical-document').replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  return (
    <main className="page shell">
      <section className="documents-heading">
        <div><p className="section-kicker">CARE RECORDS</p><h1>{role === 'DOCTOR' ? 'Clinical documents' : 'Medical documents'}</h1><p>{role === 'DOCTOR' ? 'Authorized prescriptions and care notes you have prepared.' : 'Prescriptions and treatment notes shared by your veterinarian.'}</p></div>
        <div className="document-count"><strong>{documents.length}</strong><span>{documents.length === 1 ? 'document' : 'documents'}</span></div>
      </section>
      <div className="documents-toolbar"><span>All records</span><span>Newest first</span></div>
        {loading ? (
          <div className="loading-row"><span className="call-spinner" />Loading medical documents…</div>
        ) : documents.length === 0 ? (
          <div className="documents-empty"><span aria-hidden="true">▤</span><h2>No documents yet</h2><p>Authorized care notes will appear here for you to review and download.</p></div>
        ) : (
          <div className="documents-list">
            {documents.map((document) => (
              <article key={document.id} className="document-row">
                <div className="document-file-mark">PDF</div>
                <div className="document-row-main">
                  <span className="section-kicker">AUTHORIZED CARE NOTE</span>
                  <h2>{document.title}</h2>
                  <p>{document.content || document.notes || 'Treatment instructions prepared for this appointment.'}</p>
                  <div className="document-meta"><span>{document.doctor?.user?.fullName ?? document.authenticatedBy ?? 'Veterinary doctor'}</span><time>{new Date(document.createdAt).toLocaleDateString()}</time><span>{document.medicines?.length ?? 0} medicines</span></div>
                </div>
                <button className="button secondary" onClick={() => handleDownload(document)}>↓ Download PDF</button>
              </article>
            ))}
          </div>
        )}
    </main>
  )
}
