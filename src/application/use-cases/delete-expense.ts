import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export interface DeleteExpenseUseCaseRequest {
  id: string
}

export class DeleteExpenseUseCase {
  constructor(private expensesRepository: ExpensesRepository) { }

  async execute({ id }: DeleteExpenseUseCaseRequest): Promise<void> {
    const existingExpense = await this.expensesRepository.findById(id)

    if (!existingExpense) {
      throw new Error('Expense not found')
    }

    await this.expensesRepository.delete(id)
  }
}
