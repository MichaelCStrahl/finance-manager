import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export interface DeleteExpenseUseCaseRequest {
  id: string
}

export class DeleteExpenseUseCase {
  constructor(private expensesRepository: ExpensesRepository) {}

  async execute({ id }: DeleteExpenseUseCaseRequest): Promise<void> {
    await this.expensesRepository.delete(id)
  }
}
