import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { createUser, listUsers, updateUser, deactivateUser } from '../controllers/users.controller.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const userSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'manager']),
    password: z.string().min(6)
  })
})

const updateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'manager']).optional(),
    password: z.string().min(6).optional()
  })
})

const idSchema = z.object({ params: z.object({ id: z.string().min(1) }) })

router.use(authenticate)
router.use(authorize('admin'))
router.get('/', listUsers)
router.post('/', validate(userSchema), createUser)
router.put('/:id', validate(updateSchema), updateUser)
router.delete('/:id', validate(idSchema), deactivateUser)

export default router
