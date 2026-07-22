import { GetMonthSummaryUseCase } from '@/src/application/use-cases/get-month-summary'
import { InMemoryIncomesRepository } from '@/test/repositories/in-memory-incomes-repository'
import { InMemoryExpensesRepository } from '@/test/repositories/in-memory-expenses-repository'

let inMemoryIncomesRepository: InMemoryIncomesRepository
let inMemoryExpensesRepository: InMemoryExpensesRepository
let sut: GetMonthSummaryUseCase

describe('Get Month Summary Use Case', () => {
  beforeEach(() => {
    inMemoryIncomesRepository = new InMemoryIncomesRepository()
    inMemoryExpensesRepository = new InMemoryExpensesRepository()
    sut = new GetMonthSummaryUseCase(
      inMemoryIncomesRepository,
      inMemoryExpensesRepository,
    )
  })

  it('should return the month summary', async () => {
    await inMemoryIncomesRepository.create({
      name: 'Salário',
      amountCents: 500000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
    })

    await inMemoryExpensesRepository.create({
      name: 'Aluguel',
      amountCents: 150000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    const result = await sut.execute({ yearMonth: '2026-07' })

    expect(result).toEqual({
      yearMonth: '2026-07',
      totalIncomeCents: 500000,
      totalExpenseCents: 150000,
      balanceCents: 350000,
    })
  })
})
