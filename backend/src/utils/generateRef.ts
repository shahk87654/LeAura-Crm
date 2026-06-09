let counter = 1

export function generateBookingRef() {
  const year = new Date().getFullYear()
  const padded = String(counter++).padStart(4, '0')
  return `LAG-${year}-${padded}`
}
