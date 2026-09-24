import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const adminApprovalSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
})

router.get('/pending-admins', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'ADMIN', status: 'PENDING_ADMIN_APPROVAL' },
  })
  return res.json(users)
})

router.patch('/pending-admins/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = adminApprovalSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid approval action.' })
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: parsed.data.action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' },
  })

  return res.json(user)
})

export default router
