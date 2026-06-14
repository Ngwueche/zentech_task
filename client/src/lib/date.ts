import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return format(date, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return format(date, 'MMM d, yyyy · HH:mm')
  } catch {
    return '—'
  }
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatTimeOnly(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return format(date, 'HH:mm:ss')
  } catch {
    return '—'
  }
}
