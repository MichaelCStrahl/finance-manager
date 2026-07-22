import { isActiveInMonth } from '@/src/domain/is-active-in-month'
import { ExpensesRepository } from '@/src/application/repositories/expenses-repository'

export class InMemoryExpensesRepository implements ExpensesRepository {
  public items: Expense[] = []

  async create(expense: CreateExpenseData): Promise<Expense> {
    const now = new Date().toISOString()

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...expense,
      recurrenceMonths: expense.recurrenceMonths ?? null,
      comment: expense.comment ?? null,
      tagIds: expense.tagIds ?? [],
      createdAt: now,
      updatedAt: now,
    }

    this.items.push(newExpense)

    return newExpense
  }

  async update(id: string, expense: UpdateExpenseData): Promise<Expense> {
    const now = new Date().toISOString()

    const index = this.items.findIndex((item) => item.id === id)

    if (index < 0) {
      throw new Error('Expense not found.')
    }

    const current = this.items[index]

    const updated: Expense = {
      ...current,
      ...expense,
      recurrenceMonths: expense.recurrenceMonths ?? current.recurrenceMonths,
      comment: expense.comment ?? current.comment,
      tagIds: expense.tagIds ?? current.tagIds,
      updatedAt: now,
    }

    this.items[index] = updated

    return updated
  }

  async findById(id: string): Promise<Expense | null> {
    return this.items.find((item) => item.id === id) ?? null
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)

    if (index < 0) {
      throw new Error('Expense not found.')
    }

    this.items.splice(index, 1)
  }

  async listByMonth(yearMonth: string): Promise<Expense[]> {
    return this.items.filter((expense) => isActiveInMonth(expense, yearMonth))
  }

  async sumByMonth(yearMonth: string): Promise<number> {
    const expenses = await this.listByMonth(yearMonth)

    return expenses.reduce((total, expense) => total + expense.amountCents, 0)
  }
}
