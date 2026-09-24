import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  reason: z.string().min(2),
  animalType: z.string().optional(),
  animalName: z.string().optional(),
  animalAge: z.string().optional(),
  animalGender: z.string().optional(),
  animalSymptoms: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
})

router.post('/', requireAuth, requireRole('FARMER'), async (req: AuthRequest, res) => {
  const parsed = appointmentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Please complete the appointment form.' })
  }

  const doctor = await prisma.doctorProfile.findUnique({ where: { id: parsed.data.doctorId } })
  if (!doctor || doctor.verificationStatus !== 'APPROVED') {
    return res.status(400).json({ message: 'This doctor is not currently available for appointments.' })
  }

  const appointment = await prisma.appointment.create({
    data: {
      farmerId: req.user!.userId,
      doctorId: parsed.data.doctorId,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      reason: parsed.data.reason,
      animalType: parsed.data.animalType ?? 'Other',
      animalName: parsed.data.animalName ?? null,
      animalAge: parsed.data.animalAge ?? null,
      animalGender: parsed.data.animalGender ?? null,
      animalSymptoms: parsed.data.animalSymptoms ?? null,
      duration: parsed.data.duration ?? null,
      notes: parsed.data.notes ?? null,
      status: 'REQUESTED',
    },
  })

  return res.status(201).json(appointment)
})

router.get('/mine', requireAuth, async (req: AuthRequest, res) => {
  const appointments = await prisma.appointment.findMany({
    where: req.user!.role === 'FARMER' ? { farmerId: req.user!.userId } : { doctor: { userId: req.user!.userId } },
    include: {
      doctor: { include: { user: true } },
      farmer: true,
      review: true,
      payment: true,
      medicalDocument: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return res.json(appointments)
})

router.patch('/:id/status', requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.body as { status?: 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' }
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: { doctor: true, farmer: true },
  })

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found.' })
  }

  if (req.user!.role === 'DOCTOR' && appointment.doctor.userId !== req.user!.userId) {
    return res.status(403).json({ message: 'You do not have access to this appointment.' })
  }

  if (req.user!.role === 'FARMER' && appointment.farmerId !== req.user!.userId) {
    return res.status(403).json({ message: 'You do not have access to this appointment.' })
  }

  if (status && ['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    })
    return res.json(updated)
  }

  return res.status(400).json({ message: 'Invalid appointment status.' })
})

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: {
      doctor: { include: { user: true } },
      farmer: true,
      payment: true,
      review: true,
      medicalDocument: true,
    },
  })

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found.' })
  }

  if (req.user!.role === 'FARMER' && appointment.farmerId !== req.user!.userId) {
    return res.status(403).json({ message: 'You do not have access to this appointment.' })
  }

  if (req.user!.role === 'DOCTOR' && appointment.doctor.userId !== req.user!.userId) {
    return res.status(403).json({ message: 'You do not have access to this appointment.' })
  }

  return res.json(appointment)
})

export default router
