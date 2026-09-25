import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { api } from '../api'
import 'leaflet/dist/leaflet.css'

type Coordinates = [number, number]

const defaultLocation: Coordinates = [20.5937, 78.9629]

function MapViewport({ location }: { location: Coordinates }) {
  const map = useMap()
  useEffect(() => {
    map.setView(location)
  }, [location, map])
  return null
}

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState<Coordinates>(defaultLocation)
  const [locationMessage, setLocationMessage] = useState('Finding doctors near your location...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is unavailable. Showing doctors near the default map area.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude])
        setLocationMessage('Showing approved doctors near you.')
      },
      () => setLocationMessage('Location permission was not granted. Showing doctors near the default map area.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => {
      api.get('/doctors/nearby', {
        params: { lat: location[0], lng: location[1], radius: 200, ...(search.trim() ? { search: search.trim() } : {}) },
      })
        .then((res) => setDoctors(res.data))
        .catch(() => setDoctors([]))
        .finally(() => setLoading(false))
    }, search ? 250 : 0)

    return () => window.clearTimeout(timer)
  }, [location, search])

  const doctorsWithLocation = doctors.filter(
    (doctor) => Number.isFinite(doctor.latitude) && Number.isFinite(doctor.longitude),
  )

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand">AniCare</div>
      </header>

      <section className="card">
        <h1>Find Doctors</h1>
        <p className="muted">{locationMessage}</p>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialization" />
      </section>

      <section className="card map-card">
        <MapContainer center={location} zoom={5} scrollWheelZoom className="doctor-map">
          <MapViewport location={location} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker center={location} pathOptions={{ color: '#145638', fillColor: '#1f7a4d', fillOpacity: 0.9 }} radius={9}>
            <Popup>Your location</Popup>
          </CircleMarker>
          {doctorsWithLocation.map((doctor) => (
            <CircleMarker
              key={doctor.id}
              center={[doctor.latitude, doctor.longitude]}
              pathOptions={{ color: '#b45309', fillColor: '#f59e0b', fillOpacity: 0.9 }}
              radius={8}
            >
              <Tooltip permanent direction="top" offset={[0, -8]} className="doctor-map-label">
                <span aria-hidden="true">👤</span> {doctor.fullName}
                <br />
                {doctor.specialization ?? 'Veterinary doctor'}
                <br />
                Rating: {doctor.rating ?? 0} ★
              </Tooltip>
              <Popup>
                <strong>👤 {doctor.fullName}</strong>
                <br />
                {doctor.specialization ?? 'Veterinary doctor'}
                <br />
                Rating: {doctor.rating ?? 0} ★
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </section>

      <section className="stack">
        {loading ? <div className="card empty-state">Finding nearby veterinary doctors...</div> : doctors.length === 0 ? <div className="card empty-state">No nearby veterinary doctors found.</div> : doctors.map((doctor) => (
          <div key={doctor.id} className="card doctor-card">
            <div className="doctor-header">
              <div>
                <h3><span className="profile-icon" aria-hidden="true">👤</span>{doctor.fullName}</h3>
                <p>{doctor.degree ?? 'Veterinary Doctor'}</p>
              </div>
              <span className="badge">Verified</span>
            </div>
            <p>{doctor.specialization ?? 'General practice'}</p>
            <p>Rating: {doctor.rating ?? 4.5} ★</p>
            <p>{doctor.distance ? `${doctor.distance.toFixed(1)} km away` : 'Near you'}</p>
            <Link className="button primary" to={`/farmer/doctors/${doctor.id}`}>View Profile</Link>
          </div>
        ))}
      </section>
    </main>
  )
}
