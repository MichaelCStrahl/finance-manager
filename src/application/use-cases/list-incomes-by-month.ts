import { IncomesRepository } from '@/src/application/repositories/incomes-repository'

export interface ListIncomesByMonthUseCaseRequest {
  yearMonth: string // YYYY-MM
}

export interface ListIncomesByMonthUseCaseResponse {
  incomes: Income[]
}

export class ListIncomesByMonthUseCase {
  constructor(private incomesRepository: IncomesRepository) {}

  async execute({
    yearMonth,
  }: ListIncomesByMonthUseCaseRequest): Promise<ListIncomesByMonthUseCaseResponse> {
    const incomes = await this.incomesRepository.listByMonth(yearMonth)

    return { incomes }
  }
}
