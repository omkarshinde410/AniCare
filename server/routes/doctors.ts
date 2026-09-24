import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('FARMER'), async (_req, res) => {
  const doctors = await prisma.doctorProfile.findMany({
    where: { verificationStatus: 'APPROVED' },
    include: { user: true },
  })
  return res.json(doctors)
})

router.get('/nearby', requireAuth, requireRole('FARMER'), async (req: AuthRequest, res) => {
  const { lat, lng, radius, search } = req.query as Record<string, string | undefined>
  const latitude = Number(lat)
  const longitude = Number(lng)
  const maxDistance = Number(radius ?? 50)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ message: 'Location is required to find nearby doctors.' })
  }

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      verificationStatus: 'APPROVED',
      ...(search ? {
        OR: [
          { fullName: { contains: search } },
          { specialization: { contains: search } },
          { degree: { contains: search } },
        ],
      } : {}),
    },
    include: { user: true },
  })

  const withDistance = doctors
    .map((doctor) => {
      const distance = doctor.latitude && doctor.longitude
        ? Math.hypot(doctor.latitude - latitude, doctor.longitude - longitude) * 111.2
        : Number.POSITIVE_INFINITY
      return { ...doctor, distance }
    })
    .filter((doctor) => Number.isFinite(doctor.distance) && doctor.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)

  return res.json(withDistance)
})

router.get('/me', requireAuth, requireRole('DOCTOR'), async (req: AuthRequest, res) => {
  const profile = await prisma.doctorProfile.findUnique({ where: { userId: req.user!.userId } })
  return res.json(profile)
})

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: req.params.id },
    include: { user: true },
  })

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found.' })
  }

  return res.json(doctor)
})

const optionalText = z.preprocess(
  (value) => value === null ? undefined : value,
  z.string().optional(),
)
const optionalNumber = z.preprocess(
  (value) => value === '' || value === null ? undefined : value,
  z.coerce.number().min(0).optional(),
)

const doctorProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  degree: optionalText,
  university: optionalText,
  specialization: optionalText,
  experienceYears: optionalNumber,
  licenseNumber: optionalText,
  profilePhoto: optionalText,
  address: optionalText,
  city: optionalText,
  state: optionalText,
  country: optionalText,
  latitude: optionalNumber,
  longitude: optionalNumber,
  bio: optionalText,
  availability: optionalText,
})

router.post('/profile', requireAuth, requireRole('DOCTOR'), async (req: AuthRequest, res) => {
  const parsed = doctorProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Doctor profile details are invalid.' })
  }

  const doctor = await prisma.doctorProfile.upsert({
    where: { userId: req.user!.userId },
    update: parsed.data,
    create: {
      userId: req.user!.userId,
      fullName: req.user!.email,
      ...parsed.data,
    },
  })

  return res.json(doctor)
})

router.get('/pending', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const doctors = await prisma.doctorProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: true },
  })
  return res.json(doctors)
})

router.patch('/:id/verify', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { status } = req.body as { status?: 'APPROVED' | 'REJECTED' }
  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Status must be APPROVED or REJECTED.' })
  }

  const profile = await prisma.doctorProfile.update({
    where: { id: req.params.id },
    data: { verificationStatus: status, verifiedAt: new Date() },
    include: { user: true },
  })

  await prisma.user.update({
    where: { id: profile.userId },
    data: { status: status === 'APPROVED' ? 'ACTIVE' : 'REJECTED' },
  })

  return res.json(profile)
})

export default router
