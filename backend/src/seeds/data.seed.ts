import mongoose from 'mongoose'
import Lead from '../models/Lead.model.js'
import Booking from '../models/Booking.model.js'
import Package from '../models/Package.model.js'
import FollowUp from '../models/FollowUp.model.js'
import Payment from '../models/Payment.model.js'
import User from '../models/User.model.js'
import { env } from '../config/env.js'

async function seedData() {
  await mongoose.connect(env.mongodbUri)

  // Get admin user
  const admin = await User.findOne({ email: 'admin@leauragrand.com' })
  if (!admin) {
    console.log('Admin user not found. Please run seed:admin first.')
    process.exit(1)
  }

  // Clear existing data
  await Lead.deleteMany({})
  await Booking.deleteMany({})
  await Package.deleteMany({})
  await FollowUp.deleteMany({})
  await Payment.deleteMany({})

  // Create packages
  const packages = await Package.insertMany([
    {
      name: 'Silver Wedding Package',
      description: 'Basic wedding package with essential services',
      price: 150000,
      includes: ['Venue setup', 'Basic catering', 'Decoration', 'Sound system'],
      isActive: true
    },
    {
      name: 'Gold Wedding Package',
      description: 'Premium wedding package with all services',
      price: 300000,
      includes: [
        'Venue setup',
        'Full catering',
        'Premium decoration',
        'Sound system',
        'Photography',
        'Videography'
      ],
      isActive: true
    },
    {
      name: 'Platinum Wedding Package',
      description: 'Luxury wedding package with premium services',
      price: 500000,
      includes: [
        'Venue setup',
        'Gourmet catering',
        'Luxury decoration',
        'Professional sound system',
        'Professional photography',
        '4K videography',
        'Drone coverage',
        'Wedding planning consultation'
      ],
      isActive: true
    },
    {
      name: 'Corporate Event Package',
      description: 'Corporate event management and coordination',
      price: 100000,
      includes: ['Venue setup', 'Catering', 'Sound system', 'Basic decoration'],
      isActive: true
    }
  ])

  console.log(`Created ${packages.length} packages`)

  // Create sample leads
  const leads = await Lead.insertMany([
    {
      fullName: 'Ahmed Khan',
      phone: '03001234567',
      email: 'ahmed@example.com',
      source: 'instagram',
      eventType: 'wedding',
      eventDate: new Date('2026-12-15'),
      guestCount: 300,
      budgetRange: '250000-350000',
      venueArea: 'full_venue',
      stage: 'interested',
      priority: 'high',
      assignedTo: admin.id,
      notes: 'Very interested, wants to visit venue next week'
    },
    {
      fullName: 'Fatima Ali',
      phone: '03009876543',
      email: 'fatima@example.com',
      source: 'referral',
      eventType: 'mehndi',
      eventDate: new Date('2026-11-20'),
      guestCount: 150,
      budgetRange: '80000-120000',
      venueArea: 'banquet_hall',
      stage: 'proposal_sent',
      priority: 'medium',
      assignedTo: admin.id,
      notes: 'Waiting for family confirmation'
    },
    {
      fullName: 'Hassan Malik',
      phone: '03005555555',
      email: 'hassan@example.com',
      source: 'facebook',
      eventType: 'walima',
      eventDate: new Date('2026-12-20'),
      guestCount: 200,
      budgetRange: '150000-200000',
      venueArea: 'banquet_hall',
      stage: 'proposal_sent',
      priority: 'high',
      assignedTo: admin.id,
      notes: 'Already visited venue, very satisfied'
    },
    {
      fullName: 'Sara Ahmed',
      phone: '03004444444',
      email: 'sara@example.com',
      source: 'website',
      eventType: 'engagement',
      eventDate: new Date('2026-10-30'),
      guestCount: 100,
      budgetRange: '50000-80000',
      venueArea: 'rooftop',
      stage: 'contacted',
      priority: 'medium',
      assignedTo: admin.id,
      notes: 'Initial inquiry received'
    },
    {
      fullName: 'Ali Hassan',
      phone: '03003333333',
      email: 'ali@example.com',
      source: 'walk_in',
      eventType: 'wedding',
      eventDate: new Date('2026-11-10'),
      guestCount: 250,
      budgetRange: '200000-300000',
      venueArea: 'full_venue',
      stage: 'new',
      priority: 'low',
      assignedTo: admin.id,
      notes: 'Walk-in inquiry, still deciding'
    },
    {
      fullName: 'Zainab Malik',
      phone: '03002222222',
      email: 'zainab@example.com',
      source: 'phone',
      eventType: 'corporate',
      eventDate: new Date('2026-09-15'),
      guestCount: 50,
      budgetRange: '80000-100000',
      venueArea: 'banquet_hall',
      stage: 'negotiating',
      priority: 'high',
      assignedTo: admin.id,
      notes: 'Corporate event, final negotiation phase'
    }
  ])

  console.log(`Created ${leads.length} leads`)

  // Create bookings from some leads
  const bookings = await Booking.insertMany([
    {
      lead: leads[0].id,
      clientName: 'Ahmed Khan',
      phone: '03001234567',
      email: 'ahmed@example.com',
      eventType: 'wedding',
      eventDate: new Date('2026-12-15'),
      eventTimeStart: '18:00',
      eventTimeEnd: '23:00',
      guestCount: 300,
      venueArea: 'full_venue',
      package: packages[1].id,
      customServices: [{ name: 'Extra Catering', price: 50000 }],
      totalAmount: 350000,
      advancePaid: 100000,
      paymentStatus: 'partial',
      bookingStatus: 'confirmed',
      specialRequirements: 'Vegetarian menu for 50 guests',
      assignedManager: admin.id
    },
    {
      lead: leads[2].id,
      clientName: 'Hassan Malik',
      phone: '03005555555',
      email: 'hassan@example.com',
      eventType: 'walima',
      eventDate: new Date('2026-12-20'),
      eventTimeStart: '19:00',
      eventTimeEnd: '22:00',
      guestCount: 200,
      venueArea: 'banquet_hall',
      package: packages[0].id,
      customServices: [],
      totalAmount: 150000,
      advancePaid: 50000,
      paymentStatus: 'partial',
      bookingStatus: 'confirmed',
      specialRequirements: 'Please arrange reserved parking',
      assignedManager: admin.id
    }
  ])

  console.log(`Created ${bookings.length} bookings`)

  // Create payments for bookings
  const payments = await Payment.insertMany([
    {
      booking: bookings[0].id,
      amount: 100000,
      method: 'bank_transfer',
      reference: 'TXN001',
      receivedBy: admin.id,
      notes: 'Advance payment received',
      paidAt: new Date('2026-06-01')
    },
    {
      booking: bookings[1].id,
      amount: 50000,
      method: 'cash',
      reference: 'CASH001',
      receivedBy: admin.id,
      notes: 'Advance payment in cash',
      paidAt: new Date('2026-06-05')
    }
  ])

  console.log(`Created ${payments.length} payments`)

  // Create follow-ups
  const followups = await FollowUp.insertMany([
    {
      lead: leads[0].id,
      manager: admin.id,
      type: 'call',
      scheduledAt: new Date('2026-06-15'),
      status: 'pending',
      notes: 'Follow up on wedding preferences'
    },
    {
      lead: leads[1].id,
      manager: admin.id,
      type: 'site_visit',
      scheduledAt: new Date('2026-06-12'),
      status: 'pending',
      notes: 'Family visit to venue'
    },
    {
      lead: leads[2].id,
      manager: admin.id,
      type: 'call',
      scheduledAt: new Date('2026-06-10'),
      status: 'completed',
      completedAt: new Date('2026-06-10'),
      outcome: 'booked',
      notes: 'Booking confirmed over phone call'
    },
    {
      lead: leads[3].id,
      manager: admin.id,
      type: 'email',
      scheduledAt: new Date('2026-06-11'),
      status: 'pending',
      notes: 'Send engagement package details'
    }
  ])

  console.log(`Created ${followups.length} follow-ups`)

  console.log('✅ Sample data seeded successfully!')
  process.exit(0)
}

seedData().catch((error) => {
  console.error('❌ Seed error:', error)
  process.exit(1)
})
