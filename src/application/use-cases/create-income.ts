import { IncomesRepository } from "@/application/repositories/incomes-repository"

export interface CreateIncomeUseCaseRequest {
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths?: number | null
  comment?: string | null
}

export interface CreateIncomeUseCaseResponse {
  income: Income
}

export class CreateIncomeUseCase {
  constructor(private incomesRepository: IncomesRepository) { }

  async execute({
    name,
    amountCents,
    occurredOn,
    recurrenceType,
    recurrenceMonths,
    comment,
  }: CreateIncomeUseCaseRequest): Promise<CreateIncomeUseCaseResponse> {
    const income = await this.incomesRepository.create({
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