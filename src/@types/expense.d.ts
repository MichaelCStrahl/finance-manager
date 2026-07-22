type Expense = {
  id: string
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths: number | null
  categoryId: string
  paymentMethodId: string
  comment: string | null
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

type CreateExpenseData = {
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths?: number | null
  categoryId: string
  paymentMethodId: string
  comment?: string | null
  tagIds?: string[]
}

type UpdateExpenseData = {
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths?: number | null
  categoryId: string
  paymentMethodId: string
  comment?: string | null
  tagIds?: string[]
}
