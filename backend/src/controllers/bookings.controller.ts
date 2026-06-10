import { type Request, type Response, type NextFunction } from 'express'
import Booking from '../models/Booking.model.js'
import Payment from '../models/Payment.model.js'
import Lead from '../models/Lead.model.js'
import { AuthedRequest } from '../middleware/authenticate.js'

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const filter: any = { deletedAt: { $exists: false } }
    if (req.query.status) filter.bookingStatus = req.query.status
    if (req.query.venueArea) filter.venueArea = req.query.venueArea
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus
    if (req.query.manager) filter.assignedManager = req.query.manager
    if (req.query.startDate || req.query.endDate) {
      filter.eventDate = {}
      if (req.query.startDate) filter.eventDate.$gte = new Date(String(req.query.startDate))
      if (req.query.endDate) filter.eventDate.$lte = new Date(String(req.query.endDate))
    }
    if (req.query.search) {
      filter.$or = [
        { clientName: { $regex: String(req.query.search), $options: 'i' } },
        { phone: { $regex: String(req.query.search), $options: 'i' } }
      ]
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin') {
      filter.assignedManager = user?.id
    }
    const total = await Booking.countDocuments(filter)
    const items = await Booking.find(filter)
      .populate('assignedManager', 'name email')
      .populate('package', 'name price')
      .sort({ eventDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    res.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    next(error)
  }
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin') {
      data.assignedManager = user?.id
    }
    if (data.lead) {
      const lead = await Lead.findById(data.lead)
      if (lead) {
        data.clientName ||= lead.fullName
        data.phone ||= lead.phone
        data.email ||= lead.email
      }
    }
    // Generate unique booking reference
    const { generateBookingRef } = await import('../utils/generateRef.js')
    data.bookingRef = await generateBookingRef()
    const booking = await Booking.create(data)
    res.status(201).json({ success: true, data: booking })
  } catch (error) {
    next(error)
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('assignedManager', 'name email')
      .populate('package', 'name price includes')
      .populate('lead', 'fullName phone')
    if (!booking || booking.deletedAt) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin' && booking.assignedManager?.toString() !== user?.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    const payments = await Payment.find({ booking: booking.id }).populate('receivedBy', 'name')
    res.json({ success: true, data: { booking, payments } })
  } catch (error) {
    next(error)
  }
}

export async function updateBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking || booking.deletedAt) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin' && booking.assignedManager?.toString() !== user?.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    Object.assign(booking, req.body)
    await booking.save()
    res.json({ success: true, data: booking })
  } catch (error) {
    next(error)
  }
}

export async function patchBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking || booking.deletedAt) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin' && booking.assignedManager?.toString() !== user?.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    booking.bookingStatus = req.body.bookingStatus
    await booking.save()
    res.json({ success: true, data: booking })
  } catch (error) {
    next(error)
  }
}

export async function deleteBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true })
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    res.json({ success: true, data: { id: booking.id } })
  } catch (error) {
    next(error)
  }
}
