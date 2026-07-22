import { InMemoryIncomesRepository } from '@/test/repositories/in-memory-incomes-repository'
import { ListIncomesByMonthUseCase } from '@/src/application/use-cases/list-incomes-by-month'

let inMemoryIncomesRepository: InMemoryIncomesRepository
let sut: ListIncomesByMonthUseCase

describe('List Incomes By Month Use Case', () => {
  beforeEach(() => {
    inMemoryIncomesRepository = new InMemoryIncomesRepository()
    sut = new ListIncomesByMonthUseCase(inMemoryIncomesRepository)
  })

  it('should list incomes active in the given month', async () => {
    await inMemoryIncomesRepository.create({
      name: 'Freela',
      amountCents: 500,
      occurredOn: '2026-07-01',
      recurrenceType: 'once',
    })

    await inMemoryIncomesRepository.create({
      name: 'Bônus 3x',
      amountCents: 300,
      occurredOn: '2026-07-01',
      recurrenceType: 'fixed',
      recurrenceMonths: 3,
    })

    await inMemoryIncomesRepository.create({
      name: 'Salário',
      amountCents: 1000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
    })

    await inMemoryIncomesRepository.create({
      name: 'Freela antigo',
      amountCents: 200,
      occurredOn: '2026-06-01',
      recurrenceType: 'once',
    })

    const july = await sut.execute({ yearMonth: '2026-07' })
    const august = await sut.execute({ yearMonth: '2026-08' })
    const october = await sut.execute({ yearMonth: '2026-10' })

    expect(july.incomes).toHaveLength(3)
    expect(july.incomes.map((income) => income.name)).toEqual(
      expect.arrayContaining(['Freela', 'Bônus 3x', 'Salário']),
    )

    expect(august.incomes).toHaveLength(2)
    expect(august.incomes.map((income) => income.name)).toEqual(
      expect.arrayContaining(['Bônus 3x', 'Salário']),
    )

    expect(october.incomes).toHaveLength(1)
    expect(october.incomes[0].name).toBe('Salário')
  })
})
