import { SumIncomesByMonthUseCase } from '@/src/application/use-cases/sum-incomes-by-month'
import { InMemoryIncomesRepository } from '@/test/repositories/in-memory-incomes-repository'

let inMemoryIncomesRepository: InMemoryIncomesRepository
let sut: SumIncomesByMonthUseCase

describe('Sum Incomes By Month Use Case', () => {
  beforeEach(() => {
    inMemoryIncomesRepository = new InMemoryIncomesRepository()
    sut = new SumIncomesByMonthUseCase(inMemoryIncomesRepository)
  })

  it('should sum incomes active in the given month', async () => {
    await inMemoryIncomesRepository.create({
      name: 'Freela',
      amountCents: 500,
      occurredOn: '2026-07-01',
      recurrenceType: 'once',
    })

    await inMemoryIncomesRepository.create({
      name: 'Salário',
      amountCents: 1000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
    })

    await inMemoryIncomesRepository.create({
      name: 'Outro mês',
      amountCents: 200,
      occurredOn: '2026-06-01',
      recurrenceType: 'once',
    })

    const result = await sut.execute({ yearMonth: '2026-07' })

    expect(result.totalCents).toBe(1500)
  })
})
