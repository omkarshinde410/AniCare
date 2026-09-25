import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { isAppointmentInWindow } from '../appointmentWindow.js'

const router = Router()

const documentSchema = z.object({
  appointmentId: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  content: z.string().optional(),
  authenticatedBy: z.string().optional(),
  authenticationId: z.string().optional(),
  signatureData: z.string().optional(),
  medicines: z.array(z.object({
    name: z.string().min(1),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    duration: z.string().optional(),
  })).optional().default([]),
})

router.post('/', requireAuth, requireRole('DOCTOR'), async (req: AuthRequest, res) => {
  const parsed = documentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Document details are invalid.' })
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: parsed.data.appointmentId } })
  if (!appointment || appointment.status !== 'APPROVED' || !isAppointmentInWindow(appointment.date, appointment.startTime, appointment.endTime) || appointment.doctorId !== (await prisma.doctorProfile.findUnique({ where: { userId: req.user!.userId } }))?.id) {
    return res.status(403).json({ message: 'You can only create documents for your own appointments.' })
  }

  const document = await prisma.medicalDocument.create({
    data: {
      appointmentId: parsed.data.appointmentId,
      doctorId: appointment.doctorId,
      farmerId: appointment.farmerId,
      title: parsed.data.title,
      notes: parsed.data.notes ?? '',
      content: parsed.data.content ?? '',
      authenticatedBy: parsed.data.authenticatedBy ?? req.user!.email,
      authenticationId: parsed.data.authenticationId ?? `AUTH-${Date.now()}`,
      signatureData: parsed.data.signatureData ?? '',
      medicines: {
        create: parsed.data.medicines,
      },
    },
    include: { medicines: true },
  })

  await prisma.notification.create({
    data: {
      userId: appointment.farmerId,
      appointmentId: appointment.id,
      title: 'New medicine document available',
      message: 'Your veterinarian authorized a medicine document for this appointment.',
      type: 'MEDICAL_DOCUMENT_READY',
    },
  })

  return res.status(201).json(document)
})

router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const documents = await prisma.medicalDocument.findMany({
    where: req.user!.role === 'FARMER' ? { farmerId: req.user!.userId } : { doctorId: (await prisma.doctorProfile.findUnique({ where: { userId: req.user!.userId } }))?.id ?? '' },
    include: { medicines: true, appointment: true, doctor: { include: { user: true } }, farmer: true },
  })
  return res.json(documents)
})

export default router
