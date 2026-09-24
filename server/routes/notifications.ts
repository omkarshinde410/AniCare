import { Router } from 'express'
import { prisma } from '../index.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(notifications)
})

export default router
