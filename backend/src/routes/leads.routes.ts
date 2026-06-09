import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import {
  createLead,
  deleteLead,
  getLead,
  listLeads,
  patchLeadStage,
  updateLead
} from '../controllers/leads.controller.js'

const router = Router()

const createSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email().optional(),
    source: z.enum(['walk_in', 'referral', 'instagram', 'facebook', 'website', 'phone', 'whatsapp', 'other']),
    eventType: z.enum(['wedding', 'walima', 'mehndi', 'engagement', 'corporate', 'birthday', 'conference', 'other']),
    eventDate: z.string().optional(),
    guestCount: z.number().int().positive().optional(),
    budgetRange: z.string().optional(),
    venueArea: z.enum(['marquee', 'banquet_hall', 'rooftop', 'full_venue']),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional(),
    notes: z.string().optional()
  })
})

const updateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: createSchema.shape.body.extend({
    stage: z.enum(['new', 'contacted', 'interested', 'visit_scheduled', 'proposal_sent', 'negotiating', 'won', 'lost']).optional(),
    lostReason: z.string().optional()
  })
})

const patchStageSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    stage: z.enum(['new', 'contacted', 'interested', 'visit_scheduled', 'proposal_sent', 'negotiating', 'won', 'lost'])
  })
})

const idSchema = z.object({ params: z.object({ id: z.string().min(1) }) })

router.use(authenticate)
router.get('/', validate(z.object({ query: z.object({ page: z.string().optional(), limit: z.string().optional(), stage: z.string().optional(), source: z.string().optional(), eventType: z.string().optional(), assignedTo: z.string().optional(), priority: z.string().optional(), search: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional() }) })), listLeads)
router.post('/', validate(createSchema), createLead)
router.get('/:id', validate(idSchema), getLead)
router.put('/:id', validate(updateSchema), updateLead)
router.patch('/:id/stage', validate(patchStageSchema), patchLeadStage)
router.delete('/:id', authorize('admin'), validate(idSchema), deleteLead)

export default router
