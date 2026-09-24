import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const paymentSchema = z.object({
  amount: z.coerce.number().min(1),
  reason: z.string().min(2),
})

router.post('/request', requireAuth, requireRole('DOCTOR'), async (req: AuthRequest, res) => {
  const parsed = paymentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Payment details are invalid.' })
  }

  const { appointmentId, amount, reason } = { ...req.body, ...parsed.data }
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })

  if (!appointment || appointment.doctorId !== (await prisma.doctorProfile.findUnique({ where: { userId: req.user!.userId } }))?.id) {
    return res.status(403).json({ message: 'You cannot request payment for this appointment.' })
  }

  const payment = await prisma.payment.upsert({
    where: { appointmentId },
    update: { amount, reason, status: 'PENDING' },
    create: { appointmentId, amount, reason, status: 'PENDING' },
  })

  return res.json(payment)
})

router.post('/:appointmentId/pay', requireAuth, requireRole('FARMER'), async (req: AuthRequest, res) => {
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.appointmentId } })
  if (!appointment || appointment.farmerId !== req.user!.userId) {
    return res.status(403).json({ message: 'You cannot pay for this appointment.' })
  }

  const payment = await prisma.payment.upsert({
    where: { appointmentId: appointment.id },
    update: { status: 'PAID' },
    create: {
      appointmentId: appointment.id,
      amount: 0,
      reason: 'Mock payment',
      status: 'PAID',
    },
  })

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { paymentStatus: 'PAID' },
  })

  return res.json({ payment, demo: true, message: 'Mock payment completed successfully.' })
})

export default router
