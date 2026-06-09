import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User.model.js'
import { env } from '../config/env.js'

async function seed() {
  await mongoose.connect(env.mongodbUri)
  const existing = await User.findOne({ email: 'admin@leauragrand.com' })
  if (existing) {
    console.log('Admin user already exists')
    process.exit(0)
  }
  const password = await bcrypt.hash('Admin@123456', 12)
  const user = await User.create({
    name: 'Le Aura Admin',
    email: 'admin@leauragrand.com',
    password,
    role: 'admin'
  })
  console.log('Created admin user:', user.email)
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
