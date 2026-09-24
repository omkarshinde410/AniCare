import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/farmer/alerts" element={<AlertsPage />} />
        <Route path="/farmer/profile" element={<ProfilePage />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/approvals" element={<DoctorApprovalPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/doctor-approvals" element={<DoctorApprovalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
