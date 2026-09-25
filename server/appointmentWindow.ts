export function isAppointmentInWindow(date: string, startTime: string, endTime: string, now = new Date()) {
  const start = new Date(`${date}T${startTime}`)
  const end = new Date(`${date}T${endTime}`)
  return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && now >= start && now <= end
}
