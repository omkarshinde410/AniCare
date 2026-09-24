import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/me', requireAuth, requireRole('FARMER'), async (req: AuthRequest, res) => {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId: req.user!.userId } })
  return res.json(profile)
})

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
})

router.post('/location', requireAuth, requireRole('FARMER'), async (req: AuthRequest, res) => {
  const parsed = locationSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Location data is invalid.' })
  }

  const profile = await prisma.farmerProfile.upsert({
    where: { userId: req.user!.userId },
    update: parsed.data,
    create: {
      userId: req.user!.userId,
      ...parsed.data,
    },
  })

  return res.json(profile)
})

export default router
