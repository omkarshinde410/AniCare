import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const alertSchema = z.object({
  disease: z.string().min(2),
  areaName: z.string().min(2),
  radiusKm: z.coerce.number().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('HIGH'),
  description: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
})

router.post('/', requireAuth, requireRole('DOCTOR'), async (req: AuthRequest, res) => {
  const parsed = alertSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Disease alert details are invalid.' })
  }

  const doctor = await prisma.doctorProfile.findUnique({ where: { userId: req.user!.userId } })
  if (!doctor || doctor.verificationStatus !== 'APPROVED') {
    return res.status(403).json({ message: 'Only approved doctors can declare a disease alert.' })
  }

  const alert = await prisma.diseaseAlert.create({
    data: {
      doctorId: doctor.id,
      ...parsed.data,
      active: true,
    },
  })

  return res.status(201).json(alert)
})

router.get('/nearby', requireAuth, requireRole('FARMER'), async (req: AuthRequest, res) => {
  const { latitude, longitude } = req.query as { latitude?: string; longitude?: string }
  const lat = Number(latitude)
  const lng = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ message: 'Location is required to view nearby alerts.' })
  }

  const alerts = await prisma.diseaseAlert.findMany({
    where: { active: true },
    include: { doctor: { include: { user: true } } },
  })

  const nearby = alerts.filter((alert) => {
    const dx = alert.latitude - lat
    const dy = alert.longitude - lng
    const distanceKm = Math.hypot(dx, dy) * 111.2
    return distanceKm <= alert.radiusKm + 10
  })

  return res.json(nearby)
})

export default router
