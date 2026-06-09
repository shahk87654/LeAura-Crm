import { format } from 'date-fns'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(value: string | Date) {
  return format(new Date(value), 'EEE, dd MMM yyyy')
}

export function formatTime(value?: string) {
  if (!value) return ''
  return value
}
