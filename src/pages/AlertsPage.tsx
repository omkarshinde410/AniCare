import { useEffect, useState } from 'react'
import { api } from '../api'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locationMessage, setLocationMessage] = useState('Checking your location…')

  useEffect(() => {
    const loadNearbyAlerts = async () => {
      try {
        const profileResponse = await api.get('/farmers/me')
        let latitude = profileResponse.data?.latitude
        let longitude = profileResponse.data?.longitude
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 300000 })
            })
            latitude = position.coords.latitude
            longitude = position.coords.longitude
          } catch {
            if (latitude == null || longitude == null) setLocationMessage('Allow location access to see alerts near you.')
          }
        }
        if (latitude == null || longitude == null) return
        setLocationMessage('Showing active reports near your location.')
        const response = await api.get('/disease-alerts/nearby', { params: { latitude, longitude } })
        setAlerts(response.data)
      } catch {
        setLocationMessage('Unable to check nearby reports right now.')
      } finally {
        setLoading(false)
      }
    }
    void loadNearbyAlerts()
  }, [])

  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  const sortedAlerts = [...alerts].sort((a, b) => (severityOrder[a.severity as keyof typeof severityOrder] ?? 3) - (severityOrder[b.severity as keyof typeof severityOrder] ?? 3))

  return (
    <main className="page shell">
      <section className="alerts-header">
        <div><p className="section-kicker">LOCAL ANIMAL HEALTH</p><h1>Disease watch</h1><p>Active reports shared by veterinarians in your area.</p></div>
        <div className="location-chip">⌖ {locationMessage}</div>
      </section>
      <section className="alerts-summary">
        <strong>{loading ? '—' : alerts.length}</strong><span>{alerts.length === 1 ? 'active report' : 'active reports'} near you</span>
        {!loading && alerts.some((alert) => alert.severity === 'HIGH') && <b>High severity reported</b>}
      </section>
      {loading ? <div className="loading-row"><span className="call-spinner" />Finding reports near you…</div> : sortedAlerts.length === 0 ? (
          <div className="alert-empty"><span aria-hidden="true">✓</span><h2>No active reports nearby</h2><p>No veterinarian alerts match your current location. Check again later.</p></div>
        ) : (
          <div className="alert-list">
            {sortedAlerts.map((alert) => (
              <article key={alert.id} className={`alert-report severity-${String(alert.severity).toLowerCase()}`}>
                <div className="alert-report-top"><span>{alert.severity} SEVERITY</span><time>{alert.startDate}</time></div>
                <h2>{alert.disease}</h2>
                <p className="alert-area">⌖ {alert.areaName} · {alert.radiusKm} km coverage</p>
                <p>{alert.description ?? 'A veterinarian reported a local livestock or poultry health concern.'}</p>
                <footer>Reported by {alert.doctor?.fullName ?? alert.doctor?.user?.fullName ?? 'Veterinarian'}</footer>
              </article>
            ))}
          </div>
      )}
    </main>
  )
}
