import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'
import { createPackage, deletePackage, listPackages, updatePackage } from '../controllers/packages.controller.js'

const router = Router()

const packageSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    includes: z.array(z.string().min(1)).optional()
  })
})

const updateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: packageSchema.shape.body.extend({ isActive: z.boolean().optional() })
})

const idSchema = z.object({ params: z.object({ id: z.string().min(1) }) })

router.get('/', authenticate, listPackages)
router.post('/', authenticate, authorize('admin'), validate(packageSchema), createPackage)
router.put('/:id', authenticate, authorize('admin'), validate(updateSchema), updatePackage)
router.delete('/:id', authenticate, authorize('admin'), validate(idSchema), deletePackage)

export default router
