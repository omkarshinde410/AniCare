import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

export type AuthTokenPayload = {
  userId: string
  email: string
  role: 'FARMER' | 'DOCTOR' | 'ADMIN'
}

export interface AuthRequest extends Request {
  user?: AuthTokenPayload
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    const token = header.replace('Bearer ', '')
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session.' })
  }
}

export const requireRole = (...roles: Array<'FARMER' | 'DOCTOR' | 'ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' })
    }

    return next()
  }
}
