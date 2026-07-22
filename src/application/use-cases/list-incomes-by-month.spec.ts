import { InMemoryIncomesRepository } from '@/test/repositories/in-memory-incomes-repository'
import { ListIncomesByMonthUseCase } from '@/src/application/use-cases/list-incomes-by-month'

let inMemoryIncomesRepository: InMemoryIncomesRepository
let sut: ListIncomesByMonthUseCase

describe('List Incomes By Month Use Case', () => {
  beforeEach(() => {
    inMemoryIncomesRepository = new InMemoryIncomesRepository()
    sut = new ListIncomesByMonthUseCase(inMemoryIncomesRepository)
  })

  it('should list once income only in its month', async () => {
    await inMemoryIncomesRepository.create({
      name: 'Freela',
      amountCents: 500,
      occurredOn: '2026-07-01',
      recurrenceType: 'once',
    })

    const july = await sut.execute({ yearMonth: '2026-07' })
    const august = await sut.execute({ yearMonth: '2026-08' })

    expect(july.incomes).toHaveLength(1)
    expect(july.incomes[0].name).toBe('Freela')
    expect(august.incomes).toHaveLength(0)
  })

  it('should list fixed income across its months', async () => {
    await inMemoryIncomesRepository.create({
      name: 'Bônus 3x',
      amountCents: 300,
      occurredOn: '2026-07-01',
      recurrenceType: 'fixed',
      recurrenceMonths: 3,
    })

    const july = await sut.execute({ yearMonth: '2026-07' })
    const september = await sut.execute({ yearMonth: '2026-09' })
    const october = await sut.execute({ yearMonth: '2026-10' })

    expect(july.incomes).toHaveLength(1)
    expect(september.incomes).toHaveLength(1)
    expect(october.incomes).toHaveLength(0)
  })

  it('should list indefinite income from start month onward', async () => {
    await inMemoryIncomesRepository.create({
      name: 'Salário',
      amountCents: 1000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
    })

    const december = await sut.execute({ yearMonth: '2025-12' })
    const january = await sut.execute({ yearMonth: '2026-01' })
    const july = await sut.execute({ yearMonth: '2026-07' })

    expect(december.incomes).toHaveLength(0)
    expect(january.incomes).toHaveLength(1)
    expect(july.incomes).toHaveLength(1)
  })
})
