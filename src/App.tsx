import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FarmerDashboard from './pages/FarmerDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import FindDoctorsPage from './pages/FindDoctorsPage'
import DoctorProfilePage from './pages/DoctorProfilePage'
import AppointmentsPage from './pages/AppointmentsPage'
import DocumentsPage from './pages/DocumentsPage'
import AlertsPage from './pages/AlertsPage'
import ProfilePage from './pages/ProfilePage'
import BookAppointmentPage from './pages/BookAppointmentPage'
import DoctorApprovalPage from './pages/DoctorApprovalPage'
import NotificationsPage from './pages/NotificationsPage'
import NotificationToasts from './components/NotificationToasts'

function ModuleBottomNav() {
  const { pathname } = useLocation()
  const farmerLinks = [
    { to: '/farmer', label: 'Home', end: true },
    { to: '/farmer/doctors', label: 'Doctors' },
    { to: '/farmer/appointments', label: 'Appointments' },
    { to: '/farmer/alerts', label: 'Alerts' },
    { to: '/farmer/documents', label: 'Documents' },
    { to: '/farmer/notifications', label: 'Notifications' },
    { to: '/farmer/profile', label: 'Profile' },
  ]
  const doctorLinks = [
    { to: '/doctor', label: 'Home', end: true },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/documents', label: 'Documents' },
    { to: '/doctor/notifications', label: 'Notifications' },
  ]
  const links = pathname.startsWith('/farmer') ? farmerLinks : pathname.startsWith('/doctor') ? doctorLinks : null

  if (!links) return null

  return (
    <nav className={`bottom-nav ${pathname.startsWith('/doctor') ? 'doctor-bottom-nav' : 'farmer-bottom-nav'}`} aria-label="Main navigation">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ModuleBottomNav />
      <NotificationToasts />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/farmer/doctors" element={<FindDoctorsPage />} />
        <Route path="/farmer/doctors/:id" element={<DoctorProfilePage />} />
        <Route path="/farmer/doctors/:id/book" element={<BookAppointmentPage />} />
        <Route path="/farmer/appointments" element={<AppointmentsPage />} />
        <Route path="/farmer/documents" element={<DocumentsPage />} />
        <Route path="/farmer/notifications" element={<NotificationsPage />} />
        <Route path="/farmer/alerts" element={<AlertsPage />} />
        <Route path="/farmer/profile" element={<ProfilePage />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<AppointmentsPage />} />
        <Route path="/doctor/approvals" element={<AppointmentsPage />} />
        <Route path="/doctor/documents" element={<DocumentsPage />} />
        <Route path="/doctor/notifications" element={<NotificationsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/doctor-approvals" element={<DoctorApprovalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
