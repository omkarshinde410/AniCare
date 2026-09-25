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

router.patch('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  const notification = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { read: true },
  })
  if (notification.count === 0) return res.status(404).json({ message: 'Notification not found.' })
  return res.json({ ok: true })
})

export default router
