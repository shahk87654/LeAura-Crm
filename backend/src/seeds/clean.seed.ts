import mongoose from 'mongoose'
import Lead from '../models/Lead.model.js'
import Booking from '../models/Booking.model.js'
import Package from '../models/Package.model.js'
import FollowUp from '../models/FollowUp.model.js'
import Payment from '../models/Payment.model.js'
import { env } from '../config/env.js'

async function cleanSampleData() {
  await mongoose.connect(env.mongodbUri)

  console.log('Cleaning sample data from MongoDB...')

  const [leadResult, bookingResult, packageResult, followupResult, paymentResult] = await Promise.all([
    Lead.deleteMany({}),
    Booking.deleteMany({}),
    Package.deleteMany({}),
    FollowUp.deleteMany({}),
    Payment.deleteMany({})
  ])

  console.log(`Deleted ${leadResult.deletedCount ?? 0} leads`)
  console.log(`Deleted ${bookingResult.deletedCount ?? 0} bookings`)
  console.log(`Deleted ${packageResult.deletedCount ?? 0} packages`)
  console.log(`Deleted ${followupResult.deletedCount ?? 0} follow-ups`)
  console.log(`Deleted ${paymentResult.deletedCount ?? 0} payments`)

  console.log('✅ Sample data cleanup complete.')
  process.exit(0)
}

cleanSampleData().catch((error) => {
  console.error('❌ Clean error:', error)
  process.exit(1)
})
