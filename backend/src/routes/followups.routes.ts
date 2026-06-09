import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import {
  createFollowUp,
  getFollowUps,
  getOverdueFollowUps,
  getTodayFollowUps,
  updateFollowUp
} from '../controllers/followups.controller.js'

const router = Router()

const createSchema = z.object({
  body: z.object({
    lead: z.string().min(1),
    type: z.enum(['call', 'whatsapp', 'email', 'in_person', 'site_visit']),
    scheduledAt: z.string().min(1),
    notes: z.string().optional(),
    nextFollowUpAt: z.string().optional()
  })
})

const updateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['pending', 'completed', 'missed']).optional(),
    outcome: z.enum(['no_answer', 'callback_requested', 'interested', 'not_interested', 'booked', 'rescheduled']).optional(),
    notes: z.string().optional(),
    scheduledAt: z.string().optional(),
    completedAt: z.string().optional(),
    nextFollowUpAt: z.string().optional()
  })
})

const querySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    manager: z.string().optional(),
    lead: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
})

router.use(authenticate)
router.get('/', validate(querySchema), getFollowUps)
router.post('/', validate(createSchema), createFollowUp)
router.put('/:id', validate(updateSchema), updateFollowUp)
router.get('/today', getTodayFollowUps)
router.get('/overdue', getOverdueFollowUps)

export default router
