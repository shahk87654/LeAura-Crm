import { type Request, type Response, type NextFunction } from 'express'
import { ZodSchema } from 'zod'

export function validate(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.format()
      })
    }

    req.body = result.data.body
    req.params = result.data.params
    req.query = result.data.query
    next()
  }
}
