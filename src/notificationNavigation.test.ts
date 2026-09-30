import { describe, expect, it } from 'vitest'
import { getNotificationPath } from './notificationNavigation'

describe('notification destinations', () => {
  it('opens the matching appointment for video-call notifications', () => {
    expect(getNotificationPath({ type: 'VIDEO_CALL_STARTED', appointmentId: 'appt 1' }, 'FARMER'))
      .toBe('/farmer/appointments?appointmentId=appt%201')
  })

  it('opens role-specific document pages', () => {
    expect(getNotificationPath({ type: 'MEDICAL_DOCUMENT_READY' }, 'DOCTOR')).toBe('/doctor/documents')
  })
})