import { type Request, type Response, type NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500
  const message = err.message || 'Internal server error'
  console.error(err)
  return res.status(status).json({ success: false, error: message })
}
