type NotificationLink = {
  type: string
  appointmentId?: string | null
}

type UserRole = 'FARMER' | 'DOCTOR' | 'ADMIN'

export function getNotificationPath(notification: NotificationLink, role: UserRole): string {
  if (notification.type === 'MEDICAL_DOCUMENT_READY') {
    const path = role === 'DOCTOR' ? '/doctor/documents' : role === 'FARMER' ? '/farmer/documents' : '/admin'
    return notification.appointmentId && role !== 'ADMIN'
      ? `${path}?appointmentId=${encodeURIComponent(notification.appointmentId)}`
      : path
  }

  if (notification.type.startsWith('APPOINTMENT_') || notification.type.startsWith('PAYMENT_') || notification.type === 'VIDEO_CALL_STARTED') {
    const path = role === 'DOCTOR' ? '/doctor/appointments' : role === 'FARMER' ? '/farmer/appointments' : '/admin'
    return notification.appointmentId && role !== 'ADMIN'
      ? `${path}?appointmentId=${encodeURIComponent(notification.appointmentId)}`
      : path
  }

  if (notification.type.includes('ALERT') && role === 'FARMER') return '/farmer/alerts'
  if (role === 'DOCTOR') return '/doctor/notifications'
  if (role === 'ADMIN') return '/admin'
  return '/farmer/notifications'
}