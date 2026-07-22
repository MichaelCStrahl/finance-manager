import { IncomesRepository } from '@/src/application/repositories/incomes-repository'

export interface UpdateIncomeUseCaseRequest {
  id: string
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths?: number | null
  comment?: string | null
}

export interface UpdateIncomeUseCaseResponse {
  income: Income
}

export class UpdateIncomeUseCase {
  constructor(private incomesRepository: IncomesRepository) {}

  async execute({
    id,
    name,
    amountCents,
    occurredOn,
    recurrenceType,
    recurrenceMonths,
    comment,
  }: UpdateIncomeUseCaseRequest): Promise<UpdateIncomeUseCaseResponse> {
    const income = await this.incomesRepository.update(id, {
      name,
      amountCents,
      occurredOn,
      recurrenceType,
      recurrenceMonths,
      comment,
    })

    return { income }
  }
}
