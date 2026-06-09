import { type Request, type Response, type NextFunction } from 'express'
import { AuthedRequest } from './authenticate.js'

export function authorize(role: 'admin' | 'manager') {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    next()
  }
}
