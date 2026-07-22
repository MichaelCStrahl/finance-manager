import {
  differenceInCalendarMonths,
  isBefore,
  isSameMonth,
  parseISO,
  startOfMonth,
} from 'date-fns'

type RecurrenceEntry = {
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths: number | null
}

export function isActiveInMonth(
  entry: RecurrenceEntry,
  yearMonth: string,
): boolean {
  const start = startOfMonth(parseISO(entry.occurredOn))
  const target = startOfMonth(parseISO(`${yearMonth}-01`))

  if (isBefore(target, start)) {
    return false
  }

  switch (entry.recurrenceType) {
    case 'once':
      return isSameMonth(start, target)
    case 'fixed':
      if (entry.recurrenceMonths == null) {
        return false
      }

      return differenceInCalendarMonths(target, start) < entry.recurrenceMonths
    case 'indefinite':
      return true
  }
}
