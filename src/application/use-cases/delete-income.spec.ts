import { DeleteIncomeUseCase } from '@/src/application/use-cases/delete-income'
import { InMemoryIncomesRepository } from '@/test/repositories/in-memory-incomes-repository'

let inMemoryIncomesRepository: InMemoryIncomesRepository
let sut: DeleteIncomeUseCase

describe('Delete Income Use Case', () => {
  beforeEach(() => {
    inMemoryIncomesRepository = new InMemoryIncomesRepository()
    sut = new DeleteIncomeUseCase(inMemoryIncomesRepository)
  })

  it('should be able to delete a income', async () => {
    const created = await inMemoryIncomesRepository.create({
      name: 'Salário',
      amountCents: 1000,
      occurredOn: '2026-01-01',
      recurrenceType: 'once',
    })

    await sut.execute({ id: created.id })

    expect(inMemoryIncomesRepository.items).toHaveLength(0)
  })
})
