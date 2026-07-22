import { type CreateIncomeUseCaseRequest } from '@/src/application/use-cases/create-income'

export interface IncomesRepository {
  create(income: CreateIncomeUseCaseRequest): Promise<Income>
}
