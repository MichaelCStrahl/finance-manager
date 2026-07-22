import { UpdateIncomeUseCase } from '@/src/application/use-cases/update-income'
import { InMemoryIncomesRepository } from '@/test/repositories/in-memory-incomes-repository'

let inMemoryIncomesRepository: InMemoryIncomesRepository
let sut: UpdateIncomeUseCase

describe('Update Income Use Case', () => {
  beforeEach(() => {
    inMemoryIncomesRepository = new InMemoryIncomesRepository()
    sut = new UpdateIncomeUseCase(inMemoryIncomesRepository)
  })

  it('should be able to update a income', async () => {
    const created = await inMemoryIncomesRepository.create({
      name: 'Salário',
      amountCents: 1000,
      occurredOn: '2026-01-01',
      recurrenceType: 'once',
      recurrenceMonths: null,
      comment: null,
    })

    const result = await sut.execute({
      id: created.id,
      name: 'Salário atualizado',
      amountCents: 2500,
      occurredOn: '2026-02-01',
      recurrenceType: 'indefinite',
      recurrenceMonths: null,
      comment: 'Novo comentário',
    })

    expect(result.income).toEqual(
      expect.objectContaining({
        id: created.id,
        name: 'Salário atualizado',
        amountCents: 2500,
        occurredOn: '2026-02-01',
        recurrenceType: 'indefinite',
        recurrenceMonths: null,
        comment: 'Novo comentário',
        createdAt: created.createdAt,
      }),
    )
    expect(result.income.createdAt).toBe(created.createdAt)
  })
})