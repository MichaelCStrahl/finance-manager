import { DeleteExpenseUseCase } from '@/src/application/use-cases/delete-expense'
import { InMemoryExpensesRepository } from '@/test/repositories/in-memory-expenses-repository'

let inMemoryExpensesRepository: InMemoryExpensesRepository
let sut: DeleteExpenseUseCase

describe('Delete Expense Use Case', () => {
  beforeEach(() => {
    inMemoryExpensesRepository = new InMemoryExpensesRepository()
    sut = new DeleteExpenseUseCase(inMemoryExpensesRepository)
  })

  it('should be able to delete a expense', async () => {
    const created = await inMemoryExpensesRepository.create({
      name: 'Aluguel',
      amountCents: 150000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
    })

    await sut.execute({ id: created.id })

    expect(inMemoryExpensesRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a expense that does not exist', async () => {
    await expect(
      sut.execute({ id: 'non-existing-id' }),
    ).rejects.toThrow('Expense not found')
  })
})
