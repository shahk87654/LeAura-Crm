import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import {
  getLeadReport,
  getManagerReport,
  getRevenueReport,
  getSummaryReport,
  getVenueReport
} from '../controllers/reports.controller.js'

const router = Router()

const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
})

router.use(authenticate)
router.use(authorize('admin'))
router.get('/summary', validate(dateRangeSchema), getSummaryReport)
router.get('/revenue', validate(dateRangeSchema), getRevenueReport)
router.get('/leads', validate(dateRangeSchema), getLeadReport)
router.get('/manager', validate(dateRangeSchema), getManagerReport)
router.get('/venue', validate(dateRangeSchema), getVenueReport)

export default router
