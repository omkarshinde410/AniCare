import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { api } from '../api'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    api.get('/documents/my')
      .then((res) => setDocuments(res.data))
      .catch(() => setDocuments([]))
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
      <div className="card">
        <h1>My Medical Documents</h1>
        {documents.length === 0 ? (
          <p>No medicine documents available.</p>
        ) : (
          <div className="stack" style={{ marginTop: 18 }}>
            {documents.map((document) => (
              <div key={document.id} className="card" style={{ padding: 16 }}>
                <h3>{document.title}</h3>
                <p>{document.notes ?? 'Treatment note available'}</p>
                <p>Authorized by: {document.authenticatedBy ?? 'Veterinary doctor'}</p>
                <p>{new Date(document.createdAt).toLocaleDateString()}</p>
                <button className="button primary" onClick={() => handleDownload(document)}>Download PDF</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
