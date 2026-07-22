import { SumExpensesByMonthUseCase } from '@/src/application/use-cases/sum-expenses-by-month'
import { InMemoryExpensesRepository } from '@/test/repositories/in-memory-expenses-repository'

let inMemoryExpensesRepository: InMemoryExpensesRepository
let sut: SumExpensesByMonthUseCase

describe('Sum Expenses By Month Use Case', () => {
  beforeEach(() => {
    inMemoryExpensesRepository = new InMemoryExpensesRepository()
    sut = new SumExpensesByMonthUseCase(inMemoryExpensesRepository)
  })

  it('should sum expenses active in the given month', async () => {
    await inMemoryExpensesRepository.create({
      name: 'Uber',
      amountCents: 5000,
      occurredOn: '2026-07-01',
      recurrenceType: 'once',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    await inMemoryExpensesRepository.create({
      name: 'Aluguel',
      amountCents: 150000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    await inMemoryExpensesRepository.create({
      name: 'Outro mês',
      amountCents: 2000,
      occurredOn: '2026-06-01',
      recurrenceType: 'once',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    const result = await sut.execute({ yearMonth: '2026-07' })

    expect(result.totalCents).toBe(155000)
  })
})
