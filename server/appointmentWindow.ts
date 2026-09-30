const utcOffset = process.env.APPOINTMENT_UTC_OFFSET ?? '+05:30'

function parseAppointmentTime(date: string, time: string) {
  const normalizedTime = time.length === 5 ? `${time}:00` : time
  return new Date(`${date}T${normalizedTime}${utcOffset}`)
}

export function isAppointmentInWindow(date: string, startTime: string, endTime: string, now = new Date()) {
  const start = parseAppointmentTime(date, startTime)
  const end = parseAppointmentTime(date, endTime)
  return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && now >= start && now <= end
}

export function isAppointmentStartInPast(date: string, startTime: string, now = new Date()) {
  const start = parseAppointmentTime(date, startTime)
  return !Number.isFinite(start.getTime()) || start <= now
}
