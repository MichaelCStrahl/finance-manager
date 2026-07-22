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

type CreateIncomeData = {
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths?: number | null
  comment?: string | null
}

type UpdateIncomeData = {
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths?: number | null
  comment?: string | null
}