import { describe, expect, it } from 'vitest'
import { isAppointmentInWindow, isAppointmentStartInPast } from '../appointmentWindow.js'

describe('isAppointmentInWindow', () => {
  it('interprets India appointment times correctly when the server clock is UTC', () => {
    const date = '2026-09-26'

    expect(isAppointmentInWindow(date, '15:00', '16:00', new Date('2026-09-26T09:45:00.000Z'))).toBe(true)
    expect(isAppointmentInWindow(date, '15:00', '16:00', new Date('2026-09-26T09:29:00.000Z'))).toBe(false)
    expect(isAppointmentInWindow(date, '15:00', '16:00', new Date('2026-09-26T10:31:00.000Z'))).toBe(false)
  })
})

describe('isAppointmentStartInPast', () => {
  it('rejects past and invalid appointment starts using India time', () => {
    expect(isAppointmentStartInPast('2026-09-26', '15:00', new Date('2026-09-26T09:30:00.000Z'))).toBe(true)
    expect(isAppointmentStartInPast('2026-09-26', '16:00', new Date('2026-09-26T09:30:00.000Z'))).toBe(false)
    expect(isAppointmentStartInPast('not-a-date', '16:00')).toBe(true)
  })
})
