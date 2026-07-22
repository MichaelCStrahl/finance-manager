import { IncomesRepository } from '@/src/application/repositories/incomes-repository'

export interface DeleteIncomeUseCaseRequest {
  id: string
}

export class DeleteIncomeUseCase {
  constructor(private incomesRepository: IncomesRepository) { }

  async execute({ id }: DeleteIncomeUseCaseRequest): Promise<void> {
    const existingIncome = await this.incomesRepository.findById(id)

    if (!existingIncome) {
      throw new Error('Income not found')
    }

    await this.incomesRepository.delete(id)
  }
}
