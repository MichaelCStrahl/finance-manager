import { InMemoryIncomesRepository } from "@/test/repositories/in-memory-incomes-repository"
import { CreateIncomeUseCase } from "@/src/application/use-cases/create-income"


let inMemoryIncomesRepository: InMemoryIncomesRepository
let sut: CreateIncomeUseCase

describe('Create Income Use Case', () => {
  beforeEach(() => {
    inMemoryIncomesRepository = new InMemoryIncomesRepository()
    sut = new CreateIncomeUseCase(inMemoryIncomesRepository)
  })

  it('should be able to create a income', async () => {
    const result = await sut.execute({
      name: 'Salário',
      amountCents: 1000,
      occurredOn: '2026-01-01',
      recurrenceType: 'once',
      recurrenceMonths: null,
      comment: 'Comentário',
    })

    expect(result.income).toBeDefined()
    expect(inMemoryIncomesRepository.items).toHaveLength(1)
    expect(inMemoryIncomesRepository.items[0]).toEqual(result.income)
    expect(inMemoryIncomesRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Salário',
        amountCents: 1000,
        occurredOn: '2026-01-01',
        recurrenceType: 'once',
        recurrenceMonths: null,
        comment: 'Comentário',
      }),
    )
  })
})