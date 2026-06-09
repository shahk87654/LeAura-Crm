import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import { env } from '../config/env.js'

export interface AuthedRequest extends Request {
  user?: { id: string; role: string; email: string }
}

export async function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: string; email: string; role: string }
    const user = await User.findById(payload.id).select('+password')
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid authentication token' })
    }
    req.user = { id: user.id, role: user.role, email: user.email }
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }
}
