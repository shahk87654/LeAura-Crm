import { type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import FollowUp from '../models/FollowUp.model.js'
import Lead from '../models/Lead.model.js'
import Booking from '../models/Booking.model.js'
import { AuthedRequest } from '../middleware/authenticate.js'

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  manager: z.string().optional(),
  lead: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function getFollowUps(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.parse(req.query)
    const page = Number(parsed.page ?? 1)
    const limit = Number(parsed.limit ?? 20)
    const filter: any = {}
    if (parsed.status) filter.status = parsed.status
    if (parsed.type) filter.type = parsed.type
    if (parsed.manager) filter.manager = parsed.manager
    if (parsed.lead) filter.lead = parsed.lead
    if (parsed.startDate || parsed.endDate) {
      filter.scheduledAt = {}
      if (parsed.startDate) filter.scheduledAt.$gte = new Date(parsed.startDate)
      if (parsed.endDate) filter.scheduledAt.$lte = new Date(parsed.endDate)
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin') {
      filter.manager = user?.id
    }
    const total = await FollowUp.countDocuments(filter)
    const items = await FollowUp.find(filter)
      .populate('lead', 'fullName eventDate')
      .populate('manager', 'name email')
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
    res.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export async function createFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthedRequest).user
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    const lead = await Lead.findById(req.body.lead)
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }
    const followUp = await FollowUp.create({
      lead: req.body.lead,
      manager: user.id,
      type: req.body.type,
      scheduledAt: new Date(req.body.scheduledAt),
      notes: req.body.notes,
      nextFollowUpAt: req.body.nextFollowUpAt ? new Date(req.body.nextFollowUpAt) : undefined
    })
    res.status(201).json({ success: true, data: followUp })
  } catch (error) {
    next(error)
  }
}

export async function updateFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const followUp = await FollowUp.findById(req.params.id)
    if (!followUp) {
      return res.status(404).json({ success: false, error: 'Follow-up not found' })
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin' && followUp.manager.toString() !== user?.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    if (req.body.status) followUp.status = req.body.status
    if (req.body.outcome) followUp.outcome = req.body.outcome
    if (req.body.notes) followUp.notes = req.body.notes
    if (req.body.scheduledAt) followUp.scheduledAt = new Date(req.body.scheduledAt)
    if (req.body.completedAt) followUp.completedAt = new Date(req.body.completedAt)
    if (req.body.nextFollowUpAt) followUp.nextFollowUpAt = new Date(req.body.nextFollowUpAt)
    await followUp.save()
    res.json({ success: true, data: followUp })
  } catch (error) {
    next(error)
  }
}

export async function getTodayFollowUps(_req: Request, res: Response, next: NextFunction) {
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const filter: any = { scheduledAt: { $gte: start, $lte: end }, status: 'pending' }
    const user = (_req as AuthedRequest).user
    if (user?.role !== 'admin') {
      filter.manager = user?.id
    }
    const items = await FollowUp.find(filter).populate('lead', 'fullName eventDate').populate('manager', 'name')
    res.json({ success: true, data: items })
  } catch (error) {
    next(error)
  }
}

export async function getOverdueFollowUps(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date()
    const filter: any = { scheduledAt: { $lt: now }, status: 'pending' }
    const user = (_req as AuthedRequest).user
    if (user?.role !== 'admin') {
      filter.manager = user?.id
    }
    const items = await FollowUp.find(filter).populate('lead', 'fullName eventDate').populate('manager', 'name')
    res.json({ success: true, data: items })
  } catch (error) {
    next(error)
  }
}

export async function getFollowUpHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { leadId } = req.params
    const lead = await Lead.findById(leadId).populate('assignedTo', 'name email')
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }
    const followUps = await FollowUp.find({ lead: leadId })
      .populate('manager', 'name email')
      .sort({ createdAt: -1 })
    const booking = await Booking.findOne({ lead: leadId })
    res.json({ success: true, data: { lead, followUps, booking: booking ?? null } })
  } catch (error) {
    next(error)
  }
}

