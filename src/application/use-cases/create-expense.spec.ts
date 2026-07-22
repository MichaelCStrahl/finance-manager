import { CreateExpenseUseCase } from '@/src/application/use-cases/create-expense'
import { InMemoryExpensesRepository } from '@/test/repositories/in-memory-expenses-repository'

let inMemoryExpensesRepository: InMemoryExpensesRepository
let sut: CreateExpenseUseCase

describe('Create Expense Use Case', () => {
  beforeEach(() => {
    inMemoryExpensesRepository = new InMemoryExpensesRepository()
    sut = new CreateExpenseUseCase(inMemoryExpensesRepository)
  })

  it('should be able to create a expense', async () => {
    const result = await sut.execute({
      name: 'Aluguel',
      amountCents: 150000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
      recurrenceMonths: null,
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
      comment: 'Apartamento',
      tagIds: ['tag-1'],
    })

    expect(result.expense).toBeDefined()
    expect(inMemoryExpensesRepository.items).toHaveLength(1)
    expect(inMemoryExpensesRepository.items[0]).toEqual(result.expense)
    expect(inMemoryExpensesRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Aluguel',
        amountCents: 150000,
        occurredOn: '2026-01-01',
        recurrenceType: 'indefinite',
        recurrenceMonths: null,
        categoryId: 'category-1',
        paymentMethodId: 'payment-1',
        comment: 'Apartamento',
        tagIds: ['tag-1'],
      }),
    )
  })

  it('should apply default optional fields when omitted', async () => {
    const result = await sut.execute({
      name: 'Uber',
      amountCents: 5000,
      occurredOn: '2026-07-01',
      recurrenceType: 'once',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    expect(result.expense).toEqual(
      expect.objectContaining({
        recurrenceMonths: null,
        comment: null,
        tagIds: [],
      }),
    )
  })
})
