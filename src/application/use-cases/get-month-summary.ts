import { IncomesRepository } from '@/src/application/repositories/incomes-repository'
import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export interface GetMonthSummaryUseCaseRequest {
  yearMonth: string // YYYY-MM
}

export interface GetMonthSummaryUseCaseResponse {
  yearMonth: string
  totalIncomeCents: number
  totalExpenseCents: number
  balanceCents: number
}

export class GetMonthSummaryUseCase {
  constructor(
    private incomesRepository: IncomesRepository,
    private expensesRepository: ExpensesRepository,
  ) {}

  async execute({
    yearMonth,
  }: GetMonthSummaryUseCaseRequest): Promise<GetMonthSummaryUseCaseResponse> {
    const totalIncomeCents = await this.incomesRepository.sumByMonth(yearMonth)
    const totalExpenseCents =
      await this.expensesRepository.sumByMonth(yearMonth)

    return {
      yearMonth,
      totalIncomeCents,
      totalExpenseCents,
      balanceCents: totalIncomeCents - totalExpenseCents,
    }
  }
}
