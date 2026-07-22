import { IncomesRepository } from '@/src/application/repositories/incomes-repository'

export interface DeleteIncomeUseCaseRequest {
  id: string
}

export class DeleteIncomeUseCase {
  constructor(private incomesRepository: IncomesRepository) {}

  async execute({ id }: DeleteIncomeUseCaseRequest): Promise<void> {
    await this.incomesRepository.delete(id)
  }
}
