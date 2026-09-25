import type { Server as HttpServer } from 'node:http'
import type { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { WebSocketServer, WebSocket } from 'ws'
import { isAppointmentInWindow } from './appointmentWindow.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'
type SignalingSocket = WebSocket & { roomId?: string; userId?: string }
type Room = Set<SignalingSocket>

export function attachSignaling(server: HttpServer, prisma: PrismaClient) {
  const rooms = new Map<string, Room>()
  const wss = new WebSocketServer({ server, path: '/ws/signaling' })

  wss.on('connection', (socket: SignalingSocket, request) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    const token = url.searchParams.get('token')
    const appointmentId = url.searchParams.get('appointmentId')

    if (!token || !appointmentId) {
      socket.close(1008, 'Authentication and appointment are required')
      return
    }

    let userId: string
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId?: string }
      if (!payload.userId) throw new Error('Invalid token')
      userId = payload.userId
    } catch {
      socket.close(1008, 'Invalid session')
      return
    }

    prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true },
    }).then((appointment) => {
      if (!appointment || appointment.status !== 'APPROVED' || !isAppointmentInWindow(appointment.date, appointment.startTime, appointment.endTime) || (appointment.farmerId !== userId && appointment.doctor.userId !== userId)) {
        socket.close(1008, 'You are not part of this appointment')
        return
      }

      const room = rooms.get(appointmentId) ?? new Set<SignalingSocket>()
      if (room.size >= 2) {
        socket.close(1013, 'This call already has two participants')
        return
      }

      socket.roomId = appointmentId
      socket.userId = userId
      room.add(socket)
      rooms.set(appointmentId, room)
      const role = room.size === 1 ? 'offerer' : 'answerer'
      socket.send(JSON.stringify({ type: 'role', role }))
      if (room.size === 2) broadcast(room, socket, { type: 'peer-ready' })

      socket.on('message', (raw) => {
        try {
          const message = JSON.parse(raw.toString()) as { type?: string; data?: unknown }
          if (!message.type || !['offer', 'answer', 'candidate', 'hangup'].includes(message.type)) return
          broadcast(room, socket, { type: message.type, data: message.data })
        } catch {
          socket.send(JSON.stringify({ type: 'error', message: 'Invalid signaling message' }))
        }
      })

      socket.on('close', () => {
        room.delete(socket)
        broadcast(room, socket, { type: 'peer-left' })
        if (room.size === 0) rooms.delete(appointmentId)
      })
    }).catch(() => socket.close(1011, 'Unable to join call'))
  })
}

function broadcast(room: Room, sender: SignalingSocket, message: object) {
  const serialized = JSON.stringify(message)
  for (const peer of room) {
    if (peer !== sender && peer.readyState === WebSocket.OPEN) peer.send(serialized)
  }
}
