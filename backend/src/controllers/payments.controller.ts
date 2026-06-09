import { type Request, type Response, type NextFunction } from 'express'
import Payment from '../models/Payment.model.js'
import Booking from '../models/Booking.model.js'
import { AuthedRequest } from '../middleware/authenticate.js'

export async function getPaymentsForBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await Booking.findById(req.params.bookingId)
    if (!booking || booking.deletedAt) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    const user = (req as AuthedRequest).user
    if (user?.role !== 'admin' && booking.assignedManager?.toString() !== user?.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    const payments = await Payment.find({ booking: booking.id }).populate('receivedBy', 'name')
    res.json({ success: true, data: payments })
  } catch (error) {
    next(error)
  }
}

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await Booking.findById(req.body.booking)
    if (!booking || booking.deletedAt) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }
    const user = (req as AuthedRequest).user
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    if (user.role !== 'admin' && booking.assignedManager?.toString() !== user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    const payment = await Payment.create({
      booking: req.body.booking,
      amount: req.body.amount,
      method: req.body.method,
      reference: req.body.reference,
      notes: req.body.notes,
      receivedBy: user.id
    })
    booking.advancePaid = (booking.advancePaid || 0) + payment.amount
    booking.paymentStatus = booking.advancePaid >= booking.totalAmount ? 'paid' : booking.advancePaid > 0 ? 'partial' : 'unpaid'
    await booking.save()
    res.status(201).json({ success: true, data: payment })
  } catch (error) {
    next(error)
  }
}

export async function deletePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id)
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' })
    }
    res.json({ success: true, data: { id: payment.id } })
  } catch (error) {
    next(error)
  }
}
