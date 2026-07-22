type Income = {
  id: string
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths: number | null
  comment: string | null
  createdAt: string
  updatedAt: string
}