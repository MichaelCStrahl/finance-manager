import { IncomesRepository } from '@/src/application/repositories/incomes-repository'

export interface SumIncomesByMonthUseCaseRequest {
  yearMonth: string // YYYY-MM
}

export interface SumIncomesByMonthUseCaseResponse {
  totalCents: number
}

export class SumIncomesByMonthUseCase {
  constructor(private incomesRepository: IncomesRepository) {}

  async execute({
    yearMonth,
  }: SumIncomesByMonthUseCaseRequest): Promise<SumIncomesByMonthUseCaseResponse> {
    const totalCents = await this.incomesRepository.sumByMonth(yearMonth)

    return { totalCents }
  }
}
