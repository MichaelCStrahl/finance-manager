import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export interface UpdateExpenseUseCaseRequest {
  id: string
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

export interface UpdateExpenseUseCaseResponse {
  expense: Expense
}

export class UpdateExpenseUseCase {
  constructor(private expensesRepository: ExpensesRepository) { }

  async execute({
    id,
    name,
    amountCents,
    occurredOn,
    recurrenceType,
    recurrenceMonths,
    categoryId,
    paymentMethodId,
    comment,
    tagIds,
  }: UpdateExpenseUseCaseRequest): Promise<UpdateExpenseUseCaseResponse> {
    // TODO: validar se categoryId existe (categoryRepository)
    // TODO: validar se paymentMethodId existe (paymentMethodRepository)
    // TODO: validar se tagIds existem (tagRepository)

    const existingExpense = await this.expensesRepository.findById(id)

    if (!existingExpense) {
      throw new Error('Expense not found')
    }

    const expense = await this.expensesRepository.update(id, {
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
