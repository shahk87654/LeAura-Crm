import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import { getCalendarEvents } from '../controllers/calendar.controller.js'

const router = Router()

const querySchema = z.object({
  query: z.object({
    start: z.string().min(1),
    end: z.string().min(1)
  })
})

router.use(authenticate)
router.get('/events', validate(querySchema), getCalendarEvents)

export default router
