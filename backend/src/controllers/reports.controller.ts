import { type Request, type Response, type NextFunction } from 'express'
import Booking from '../models/Booking.model.js'
import Lead from '../models/Lead.model.js'
import User from '../models/User.model.js'

function buildDateRange(query: any) {
  const result: any = {}
  if (query.startDate) {
    result.$gte = new Date(String(query.startDate))
  }
  if (query.endDate) {
    const end = new Date(String(query.endDate))
    end.setHours(23, 59, 59, 999)
    result.$lte = end
  }
  return Object.keys(result).length ? result : undefined
}

export async function getSummaryReport(req: Request, res: Response, next: NextFunction) {
  try {
    const dateFilter = buildDateRange(req.query)
    const bookingFilter: any = { deletedAt: { $exists: false } }
    if (dateFilter) bookingFilter.eventDate = dateFilter
    const leadsFilter: any = { deletedAt: { $exists: false } }
    if (dateFilter) leadsFilter.eventDate = dateFilter

    const totalLeads = await Lead.countDocuments(leadsFilter)
    const confirmedBookings = await Booking.countDocuments({ ...bookingFilter, bookingStatus: 'confirmed' })
    const bookings = await Booking.find(bookingFilter).select('totalAmount')
    const revenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
    const avg = bookings.length ? revenue / bookings.length : 0
    const wonLeads = await Lead.countDocuments({ ...leadsFilter, stage: 'won' })
    const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0

    res.json({
      success: true,
      data: {
        totalLeads,
        confirmedBookings,
        revenue,
        avgBookingValue: Math.round(avg),
        conversionRate
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function getRevenueReport(req: Request, res: Response, next: NextFunction) {
  try {
    const dateFilter = buildDateRange(req.query)
    const match: any = { deletedAt: { $exists: false } }
    if (dateFilter) match.eventDate = dateFilter

    const revenueByMonth = await Booking.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$eventDate' } }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } }
    ])

    res.json({ success: true, data: revenueByMonth })
  } catch (error) {
    next(error)
  }
}

export async function getLeadReport(req: Request, res: Response, next: NextFunction) {
  try {
    const dateFilter = buildDateRange(req.query)
    const baseMatch: any = { deletedAt: { $exists: false } }
    if (dateFilter) baseMatch.eventDate = dateFilter

    const bySource = await Lead.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ])
    const byStage = await Lead.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ])
    const byEventType = await Lead.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ])

    res.json({ success: true, data: { bySource, byStage, byEventType } })
  } catch (error) {
    next(error)
  }
}

export async function getManagerReport(req: Request, res: Response, next: NextFunction) {
  try {
    const dateFilter = buildDateRange(req.query)
    const users = await User.find({ role: 'manager', isActive: true }).select('name')
    const managerData = await Promise.all(
      users.map(async (manager) => {
        const leadsAssigned = await Lead.countDocuments({ assignedTo: manager.id, deletedAt: { $exists: false } })
        const followUpsDone = 0
        const bookings = await Booking.find({ assignedManager: manager.id, deletedAt: { $exists: false }, ...(dateFilter ? { eventDate: dateFilter } : {}) })
        const revenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
        const conversions = bookings.length
        return {
          manager: manager.name,
          leadsAssigned,
          followUpsDone,
          conversions,
          revenue
        }
      })
    )
    res.json({ success: true, data: managerData })
  } catch (error) {
    next(error)
  }
}

export async function getVenueReport(req: Request, res: Response, next: NextFunction) {
  try {
    const dateFilter = buildDateRange(req.query)
    const match: any = { deletedAt: { $exists: false } }
    if (dateFilter) match.eventDate = dateFilter
    const venueUsage = await Booking.aggregate([
      { $match: match },
      { $group: { _id: '$venueArea', count: { $sum: 1 } } }
    ])
    res.json({ success: true, data: venueUsage })
  } catch (error) {
    next(error)
  }
}
