import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export interface CreateExpenseUseCaseRequest {
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

export interface CreateExpenseUseCaseResponse {
  expense: Expense
}

export class CreateExpenseUseCase {
  constructor(private expensesRepository: ExpensesRepository) {}

  async execute({
    name,
    amountCents,
    occurredOn,
    recurrenceType,
    recurrenceMonths,
    categoryId,
    paymentMethodId,
    comment,
    tagIds,
  }: CreateExpenseUseCaseRequest): Promise<CreateExpenseUseCaseResponse> {
    // TODO: validar se categoryId existe (categoryRepository)
    // TODO: validar se paymentMethodId existe (paymentMethodRepository)
    // TODO: validar se tagIds existem (tagRepository)

    const expense = await this.expensesRepository.create({
      name,
      amountCents,
      occurredOn,
      recurrenceType,
      recurrenceMonths,
      categoryId,
      paymentMethodId,
      comment,
      tagIds,
    })

    return { expense }
  }
}
