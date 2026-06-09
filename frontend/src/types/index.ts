export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager'
  phone?: string
}

export interface Lead {
  id: string
  fullName: string
  phone: string
  email?: string
  source: string
  eventType: string
  eventDate?: string
  guestCount?: number
  budgetRange?: string
  venueArea: string
  stage: string
  priority: string
  assignedTo?: User
  notes?: string
  lostReason?: string
}

export interface FollowUp {
  id: string
  lead: { id: string; fullName: string }
  manager: User
  type: string
  scheduledAt: string
  completedAt?: string
  status: string
  outcome?: string
  notes?: string
  nextFollowUpAt?: string
}

export interface Booking {
  id: string
  bookingRef: string
  lead?: { id: string; fullName: string }
  clientName: string
  phone: string
  email?: string
  eventType: string
  eventDate: string
  eventTimeStart?: string
  eventTimeEnd?: string
  guestCount?: number
  venueArea?: string
  package?: { id: string; name: string; price: number }
  customServices?: Array<{ name: string; price: number }>
  totalAmount: number
  advancePaid?: number
  balanceDue?: number
  paymentStatus: string
  bookingStatus: string
  specialRequirements?: string
  assignedManager?: User
}

export interface Payment {
  id: string
  booking: { id: string }
  amount: number
  method: string
  reference?: string
  receivedBy?: User
  notes?: string
  paidAt: string
}

export interface PackageItem {
  id: string
  name: string
  description?: string
  price: number
  includes?: string[]
  isActive: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  color: string
  extendedProps: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}
