import { type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.model.js'
import { env } from '../config/env.js'

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
})

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = loginSchema.safeParse({ body: req.body })
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: 'Invalid credentials', details: parseResult.error.format() })
    }

    const { email, password } = parseResult.data.body
    const user = await User.findOne({ email, isActive: true }).select('+password')

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: 'Email or password is incorrect' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn']
      }
    )

    return res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } } })
  } catch (error) {
    next(error)
  }
}

export async function me(req: Request, res: Response) {
  const user = (req as any).user
  return res.json({ success: true, data: user })
}
