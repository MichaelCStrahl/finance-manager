import { ListExpensesByMonthUseCase } from '@/src/application/use-cases/list-expenses-by-month'
import { InMemoryExpensesRepository } from '@/test/repositories/in-memory-expenses-repository'

let inMemoryExpensesRepository: InMemoryExpensesRepository
let sut: ListExpensesByMonthUseCase

describe('List Expenses By Month Use Case', () => {
  beforeEach(() => {
    inMemoryExpensesRepository = new InMemoryExpensesRepository()
    sut = new ListExpensesByMonthUseCase(inMemoryExpensesRepository)
  })

  it('should list once expense only in its month', async () => {
    await inMemoryExpensesRepository.create({
      name: 'Uber',
      amountCents: 5000,
      occurredOn: '2026-07-01',
      recurrenceType: 'once',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    const july = await sut.execute({ yearMonth: '2026-07' })
    const august = await sut.execute({ yearMonth: '2026-08' })

    expect(july.expenses).toHaveLength(1)
    expect(july.expenses[0].name).toBe('Uber')
    expect(august.expenses).toHaveLength(0)
  })

  it('should list fixed expense across its months', async () => {
    await inMemoryExpensesRepository.create({
      name: 'Parcela 3x',
      amountCents: 10000,
      occurredOn: '2026-07-01',
      recurrenceType: 'fixed',
      recurrenceMonths: 3,
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    const july = await sut.execute({ yearMonth: '2026-07' })
    const september = await sut.execute({ yearMonth: '2026-09' })
    const october = await sut.execute({ yearMonth: '2026-10' })

    expect(july.expenses).toHaveLength(1)
    expect(september.expenses).toHaveLength(1)
    expect(october.expenses).toHaveLength(0)
  })

  it('should list indefinite expense from start month onward', async () => {
    await inMemoryExpensesRepository.create({
      name: 'Aluguel',
      amountCents: 150000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    const december = await sut.execute({ yearMonth: '2025-12' })
    const january = await sut.execute({ yearMonth: '2026-01' })
    const july = await sut.execute({ yearMonth: '2026-07' })

    expect(december.expenses).toHaveLength(0)
    expect(january.expenses).toHaveLength(1)
    expect(july.expenses).toHaveLength(1)
  })
})
