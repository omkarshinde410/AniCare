import { useEffect, useState } from 'react'
import { api } from '../api'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    api.get('/disease-alerts/nearby', {
      params: { latitude: 20.5937, longitude: 78.9629 },
    })
      .then((res) => setAlerts(res.data))
      .catch(() => setAlerts([]))
  }, [])

  return (
    <main className="page shell">
      <div className="card">
        <h1>Disease Alerts</h1>
        {alerts.length === 0 ? (
          <p>⚠ No disease alerts nearby.</p>
        ) : (
          <div className="stack" style={{ marginTop: 18 }}>
            {alerts.map((alert) => (
              <div key={alert.id} className="card" style={{ padding: 16 }}>
                <h3>{alert.disease}</h3>
                <p><strong>Area:</strong> {alert.areaName}</p>
                <p><strong>Severity:</strong> {alert.severity}</p>
                <p>{alert.description ?? 'Local disease alert for livestock and poultry health.'}</p>
                <p>Radius: {alert.radiusKm} km</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
