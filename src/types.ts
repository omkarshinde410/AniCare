export type UserRole = 'FARMER' | 'DOCTOR' | 'ADMIN'

export type UserStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'PENDING_ADMIN_APPROVAL'

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string | null
  role: UserRole
  status: UserStatus
}

export interface DoctorProfile {
  id: string
  fullName: string
  degree?: string | null
  specialization?: string | null
  experienceYears?: number | null
  profilePhoto?: string | null
  availability?: string | null
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  rating: number
  reviewCount: number
  city?: string | null
  state?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  bio?: string | null
  user?: User
}

export interface Appointment {
  id: string
  doctorId: string
  farmerId: string
  date: string
  startTime: string
  endTime: string
  reason: string
  animalType?: string | null
  status: string
  paymentStatus?: string | null
}
