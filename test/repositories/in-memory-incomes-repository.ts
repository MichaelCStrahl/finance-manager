import { IncomesRepository } from '@/src/application/repositories/incomes-repository'
import { CreateIncomeUseCaseRequest } from '@/src/application/use-cases/create-income'

export class InMemoryIncomesRepository
  implements IncomesRepository {
  public items: Income[] = []

  async create(income: CreateIncomeUseCaseRequest): Promise<Income> {
    const newIncome: Income = {
      id: '1',
      ...income,
      comment: income.comment ?? null,
      recurrenceMonths: income.recurrenceMonths ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.items.push(newIncome)

    return newIncome
  }
}