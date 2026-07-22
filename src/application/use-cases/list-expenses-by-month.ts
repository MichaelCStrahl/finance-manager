import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export interface ListExpensesByMonthUseCaseRequest {
  yearMonth: string // YYYY-MM
}

export interface ListExpensesByMonthUseCaseResponse {
  expenses: Expense[]
}

export class ListExpensesByMonthUseCase {
  constructor(private expensesRepository: ExpensesRepository) {}

  async execute({
    yearMonth,
  }: ListExpensesByMonthUseCaseRequest): Promise<ListExpensesByMonthUseCaseResponse> {
    const expenses = await this.expensesRepository.listByMonth(yearMonth)

    return { expenses }
  }
}
