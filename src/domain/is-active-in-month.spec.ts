import { isActiveInMonth } from '@/src/domain/is-active-in-month'

describe('isActiveInMonth', () => {
  it('should handle once recurrence', () => {
    const entry = {
      occurredOn: '2026-07-15',
      recurrenceType: 'once' as const,
      recurrenceMonths: null,
    }

    expect(isActiveInMonth(entry, '2026-07')).toBe(true)
    expect(isActiveInMonth(entry, '2026-08')).toBe(false)
    expect(isActiveInMonth(entry, '2026-06')).toBe(false)
  })

  it('should handle fixed recurrence', () => {
    const entry = {
      occurredOn: '2026-07-01',
      recurrenceType: 'fixed' as const,
      recurrenceMonths: 3,
    }

    expect(isActiveInMonth(entry, '2026-07')).toBe(true)
    expect(isActiveInMonth(entry, '2026-08')).toBe(true)
    expect(isActiveInMonth(entry, '2026-09')).toBe(true)
    expect(isActiveInMonth(entry, '2026-10')).toBe(false)
    expect(isActiveInMonth(entry, '2026-06')).toBe(false)
  })

  it('should handle indefinite recurrence', () => {
    const entry = {
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite' as const,
      recurrenceMonths: null,
    }

    expect(isActiveInMonth(entry, '2025-12')).toBe(false)
    expect(isActiveInMonth(entry, '2026-01')).toBe(true)
    expect(isActiveInMonth(entry, '2026-12')).toBe(true)
  })
})
