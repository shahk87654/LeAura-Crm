import { type Request, type Response, type NextFunction } from 'express'
import Booking from '../models/Booking.model.js'
import FollowUp from '../models/FollowUp.model.js'
import { AuthedRequest } from '../middleware/authenticate.js'

export async function getCalendarEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const start = new Date(String(req.query.start))
    const end = new Date(String(req.query.end))
    const authReq = req as AuthedRequest
    const user = authReq.user
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    const bookingFilter: any = { deletedAt: { $exists: false }, eventDate: { $gte: start, $lte: end } }
    const followUpFilter: any = { scheduledAt: { $gte: start, $lte: end } }
    if (user.role !== 'admin') {
      bookingFilter.assignedManager = user.id
      followUpFilter.manager = user.id
    }
    const bookings = await Booking.find(bookingFilter).populate('assignedManager', 'name')
    const followUps = await FollowUp.find(followUpFilter).populate('lead', 'fullName')

    const events = [
      ...bookings.map((booking) => ({
        id: booking.id,
        title: `${booking.clientName} • ${booking.eventType}`,
        start: booking.eventDate,
        end: booking.eventDate,
        color: booking.bookingStatus === 'confirmed' ? '#166534' : '#6B7280',
        extendedProps: {
          type: 'booking',
          bookingStatus: booking.bookingStatus,
          venueArea: booking.venueArea,
          manager: booking.assignedManager?.name
        }
      })),
      ...followUps.map((followUp) => ({
        id: followUp.id,
        title: `${followUp.lead?.fullName} follow-up`,
        start: followUp.scheduledAt,
        end: followUp.scheduledAt,
        color: '#0f172a',
        extendedProps: {
          type: 'followup',
          status: followUp.status,
          manager: user?.id
        }
      }))
    ]

    res.json({ success: true, data: events })
  } catch (error) {
    next(error)
  }
}
