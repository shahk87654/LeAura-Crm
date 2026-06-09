import { type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import Lead from '../models/Lead.model.js'
import FollowUp from '../models/FollowUp.model.js'
import User from '../models/User.model.js'
import { AuthedRequest } from '../middleware/authenticate.js'

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  stage: z.string().optional(),
  source: z.string().optional(),
  eventType: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function listLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = querySchema.parse(req.query)
    const page = Number(parsed.page ?? 1)
    const limit = Number(parsed.limit ?? 20)

    const filter: any = { deletedAt: { $exists: false } }
    if (parsed.stage) filter.stage = parsed.stage
    if (parsed.source) filter.source = parsed.source
    if (parsed.eventType) filter.eventType = parsed.eventType
    if (parsed.priority) filter.priority = parsed.priority
    if (parsed.assignedTo) filter.assignedTo = parsed.assignedTo
    if (parsed.startDate || parsed.endDate) {
      filter.eventDate = {}
      if (parsed.startDate) filter.eventDate.$gte = new Date(parsed.startDate)
      if (parsed.endDate) filter.eventDate.$lte = new Date(parsed.endDate)
    }
    if (parsed.search) {
      filter.$or = [
        { fullName: { $regex: parsed.search, $options: 'i' } },
        { phone: { $regex: parsed.search, $options: 'i' } }
      ]
    }

    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin') {
      filter.assignedTo = user?.id
    }

    const total = await Lead.countDocuments(filter)
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({ success: true, data: { items: leads, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export async function createLead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin') {
      data.assignedTo = user?.id
    }
    const lead = await Lead.create(data)
    res.status(201).json({ success: true, data: lead })
  } catch (error) {
    next(error)
  }
}

export async function getLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email')
    if (!lead || lead.deletedAt) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }
    const followups = await FollowUp.find({ lead: lead.id }).sort({ scheduledAt: -1 })
    res.json({ success: true, data: { lead, followups } })
  } catch (error) {
    next(error)
  }
}

export async function updateLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead || lead.deletedAt) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin' && lead.assignedTo?.toString() !== user?.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    Object.assign(lead, req.body)
    await lead.save()
    res.json({ success: true, data: lead })
  } catch (error) {
    next(error)
  }
}

export async function patchLeadStage(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead || lead.deletedAt) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin' && lead.assignedTo?.toString() !== user?.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    lead.stage = req.body.stage
    await lead.save()
    res.json({ success: true, data: lead })
  } catch (error) {
    next(error)
  }
}

export async function deleteLead(req: Request, res: Response, next: NextFunction) {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true })
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }
    res.json({ success: true, data: { id: lead.id } })
  } catch (error) {
    next(error)
  }
}
