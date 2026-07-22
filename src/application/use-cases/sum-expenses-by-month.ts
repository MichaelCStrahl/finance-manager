import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export interface SumExpensesByMonthUseCaseRequest {
  yearMonth: string // YYYY-MM
}

export interface SumExpensesByMonthUseCaseResponse {
  totalCents: number
}

export class SumExpensesByMonthUseCase {
  constructor(private expensesRepository: ExpensesRepository) {}

  async execute({
    yearMonth,
  }: SumExpensesByMonthUseCaseRequest): Promise<SumExpensesByMonthUseCaseResponse> {
    const totalCents = await this.expensesRepository.sumByMonth(yearMonth)

    return { totalCents }
  }
}
