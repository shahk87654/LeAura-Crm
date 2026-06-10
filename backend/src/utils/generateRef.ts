import Booking from '../models/Booking.model.js'

export async function generateBookingRef() {
  const year = new Date().getFullYear()
  const prefix = `LAG-${year}-`
  
  // Find the highest counter for this year
  const lastBooking = await Booking.findOne(
    { bookingRef: { $regex: `^LAG-${year}-` } },
    { bookingRef: 1 }
  ).sort({ createdAt: -1 }) as any
  
  let nextCounter = 1
  if (lastBooking && lastBooking.bookingRef) {
    const match = (lastBooking.bookingRef as string).match(/LAG-\d+-([0-9]+)$/)
    if (match) {
      nextCounter = parseInt(match[1], 10) + 1
    }
  }
  
  const padded = String(nextCounter).padStart(4, '0')
  return `${prefix}${padded}`
}
