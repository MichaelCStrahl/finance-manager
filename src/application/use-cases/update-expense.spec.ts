import { UpdateExpenseUseCase } from '@/src/application/use-cases/update-expense'
import { InMemoryExpensesRepository } from '@/test/repositories/in-memory-expenses-repository'

let inMemoryExpensesRepository: InMemoryExpensesRepository
let sut: UpdateExpenseUseCase

describe('Update Expense Use Case', () => {
  beforeEach(() => {
    inMemoryExpensesRepository = new InMemoryExpensesRepository()
    sut = new UpdateExpenseUseCase(inMemoryExpensesRepository)
  })

  it('should be able to update a expense', async () => {
    const created = await inMemoryExpensesRepository.create({
      name: 'Aluguel',
      amountCents: 150000,
      occurredOn: '2026-01-01',
      recurrenceType: 'indefinite',
      categoryId: 'category-1',
      paymentMethodId: 'payment-1',
      tagIds: [],
    })

    inMemoryExpensesRepository.items[0].updatedAt = '2020-01-01T00:00:00.000Z'

    const result = await sut.execute({
      id: created.id,
      name: 'Aluguel atualizado',
      amountCents: 160000,
      occurredOn: '2026-02-01',
      recurrenceType: 'fixed',
      recurrenceMonths: 3,
      categoryId: 'category-2',
      paymentMethodId: 'payment-2',
      comment: 'Reajuste',
      tagIds: ['tag-1'],
    })

    expect(result.expense).toEqual(
      expect.objectContaining({
        id: created.id,
        name: 'Aluguel atualizado',
        amountCents: 160000,
        occurredOn: '2026-02-01',
        recurrenceType: 'fixed',
        recurrenceMonths: 3,
        categoryId: 'category-2',
        paymentMethodId: 'payment-2',
        comment: 'Reajuste',
        tagIds: ['tag-1'],
        createdAt: created.createdAt,
      }),
    )
    expect(result.expense.createdAt).toBe(created.createdAt)
    expect(result.expense.updatedAt).not.toBe('2020-01-01T00:00:00.000Z')
  })

  it('should not be able to update a expense that does not exist', async () => {
    await expect(
      sut.execute({
        id: 'non-existing-id',
        name: 'Aluguel atualizado',
        amountCents: 160000,
        occurredOn: '2026-02-01',
        recurrenceType: 'fixed',
        recurrenceMonths: 3,
        categoryId: 'category-2',
        paymentMethodId: 'payment-2',
        comment: 'Reajuste',
        tagIds: ['tag-1'],
      }),
    ).rejects.toThrow('Expense not found')
  })
})
