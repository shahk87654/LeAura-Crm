import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import {
  createBooking,
  deleteBooking,
  getBooking,
  listBookings,
  patchBookingStatus,
  updateBooking
} from '../controllers/bookings.controller.js'

const router = Router()

const createSchema = z.object({
  body: z.object({
    lead: z.string().optional(),
    clientName: z.string().min(2),
    phone: z.string().min(6),
    email: z.string().email().optional(),
    eventType: z.string().min(2),
    eventDate: z.string().min(1),
    eventTimeStart: z.string().optional(),
    eventTimeEnd: z.string().optional(),
    guestCount: z.number().int().optional(),
    venueArea: z.string().optional(),
    package: z.string().optional(),
    customServices: z.array(z.object({ name: z.string().min(1), price: z.number().min(0) })).optional(),
    totalAmount: z.number().min(0),
    advancePaid: z.number().min(0).optional(),
    specialRequirements: z.string().optional(),
    assignedManager: z.string().optional()
  })
})

const updateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: createSchema.shape.body.extend({
    bookingStatus: z.enum(['tentative', 'confirmed', 'completed', 'cancelled']).optional(),
    paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional()
  })
})

const patchStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    bookingStatus: z.enum(['tentative', 'confirmed', 'completed', 'cancelled'])
  })
})

const querySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    venueArea: z.string().optional(),
    manager: z.string().optional(),
    paymentStatus: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
})

const idSchema = z.object({ params: z.object({ id: z.string().min(1) }) })

router.use(authenticate)
router.get('/', validate(querySchema), listBookings)
router.post('/', validate(createSchema), createBooking)
router.get('/:id', validate(idSchema), getBooking)
router.put('/:id', validate(updateSchema), updateBooking)
router.patch('/:id/status', validate(patchStatusSchema), patchBookingStatus)
router.delete('/:id', authorize('admin'), validate(idSchema), deleteBooking)

export default router
