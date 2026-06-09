import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import { createPayment, deletePayment, getPaymentsForBooking } from '../controllers/payments.controller.js'

const router = Router()

const createSchema = z.object({
  body: z.object({
    booking: z.string().min(1),
    amount: z.number().min(0),
    method: z.enum(['cash', 'bank_transfer', 'cheque', 'card']),
    reference: z.string().optional(),
    notes: z.string().optional()
  })
})

const idSchema = z.object({ params: z.object({ id: z.string().min(1) }) })
const bookingSchema = z.object({ params: z.object({ bookingId: z.string().min(1) }) })

router.use(authenticate)
router.get('/booking/:bookingId', validate(bookingSchema), getPaymentsForBooking)
router.post('/', validate(createSchema), createPayment)
router.delete('/:id', authorize('admin'), validate(idSchema), deletePayment)

export default router
