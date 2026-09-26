import 'dotenv/config'
import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth.js'
import doctorRoutes from './routes/doctors.js'
import farmerRoutes from './routes/farmers.js'
import adminRoutes from './routes/admins.js'
import appointmentRoutes from './routes/appointments.js'
import paymentRoutes from './routes/payments.js'
import documentRoutes from './routes/documents.js'
import diseaseRoutes from './routes/diseaseAlerts.js'
import notificationRoutes from './routes/notifications.js'
import { attachSignaling } from './signaling.js'

export const prisma = new PrismaClient()
const app = express()
const port = Number(process.env.PORT ?? 4000)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../dist')

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }))
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https:', 'wss:'],
    },
  },
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'AniCare API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/farmers', farmerRoutes)
app.use('/api/admins', adminRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/disease-alerts', diseaseRoutes)
app.use('/api/notifications', notificationRoutes)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath))
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(err.status ?? 500).json({
    message: err.message ?? 'Unexpected server error',
  })
})

if (process.env.NODE_ENV !== 'test') {
  const server = createServer(app)
  attachSignaling(server, prisma)
  server.listen(port, () => {
    console.log(`AniCare API listening on http://localhost:${port}`)
  })
}

export default app
