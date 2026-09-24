import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../index.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(['FARMER', 'DOCTOR', 'ADMIN']).default('FARMER'),
})

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Please provide valid registration details.' })
  }

  const { fullName, email, password, phone, role } = parsed.data
  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone: phone ?? null,
      passwordHash,
      role,
      status: role === 'ADMIN' ? (adminCount === 0 ? 'ACTIVE' : 'PENDING_ADMIN_APPROVAL') : role === 'DOCTOR' ? 'PENDING' : 'ACTIVE',
    },
  })

  if (role === 'FARMER') {
    await prisma.farmerProfile.create({ data: { userId: user.id } })
  }

  if (role === 'DOCTOR') {
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        fullName,
        city: 'Not provided',
        country: 'India',
      },
    })
  }

  if (role === 'ADMIN') {
    await prisma.adminProfile.create({ data: { userId: user.id } })
  }

  return res.status(201).json({
    message: role === 'ADMIN' && adminCount > 0 ? 'Admin registration submitted for approval.' : 'Account created successfully.',
    user: { id: user.id, email: user.email, role: user.role, status: user.status },
  })
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Please provide valid login details.' })
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  if (user.role === 'DOCTOR' && user.status === 'REJECTED') {
    return res.status(403).json({ message: 'Your doctor account was rejected. Please contact an administrator.' })
  }

  if (user.role === 'ADMIN' && user.status !== 'ACTIVE') {
    return res.status(403).json({ message: 'Your admin account is awaiting approval.' })
  }

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      phone: user.phone,
    },
  })
})

export default router
