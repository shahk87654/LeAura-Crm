import { type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import User from '../models/User.model.js'

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find({ isActive: true }).select('name email role phone createdAt updatedAt')
    res.json({ success: true, data: users })
  } catch (error) {
    next(error)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, role, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already registered' })
    }
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, phone, role, password: hashed })
    res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } })
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const updateFields: any = {}
    if (req.body.name) updateFields.name = req.body.name
    if (req.body.phone) updateFields.phone = req.body.phone
    if (req.body.role) updateFields.role = req.body.role
    if (req.body.password) updateFields.password = await bcrypt.hash(req.body.password, 12)

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true }).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true })
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    res.json({ success: true, data: { id: user.id, isActive: user.isActive } })
  } catch (error) {
    next(error)
  }
}
