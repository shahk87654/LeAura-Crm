import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173')
})

const _env = envSchema.parse(process.env)

export const env = {
  mongodbUri: _env.MONGODB_URI,
  jwtSecret: _env.JWT_SECRET,
  jwtExpiresIn: _env.JWT_EXPIRES_IN,
  port: Number(_env.PORT),
  nodeEnv: _env.NODE_ENV,
  frontendUrl: _env.FRONTEND_URL
}
