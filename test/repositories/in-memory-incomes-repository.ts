import { isActiveInMonth } from '@/src/domain/is-active-in-month'
import { IncomesRepository } from '@/src/application/repositories/incomes-repository'

export class InMemoryIncomesRepository implements IncomesRepository {
  public items: Income[] = []

  async create(income: CreateIncomeData): Promise<Income> {
    const now = new Date().toISOString()

    const newIncome: Income = {
      id: crypto.randomUUID(),
      ...income,
      recurrenceMonths: income.recurrenceMonths ?? null,
      comment: income.comment ?? null,
      createdAt: now,
      updatedAt: now,
    }

    this.items.push(newIncome)

    return newIncome
  }

  async update(id: string, income: UpdateIncomeData): Promise<Income> {
    const now = new Date().toISOString()

    const index = this.items.findIndex((item) => item.id === id)

    if (index < 0) {
      throw new Error('Income not found.')
    }

    const current = this.items[index]

    const updated: Income = {
      ...current,
      ...income,
      recurrenceMonths: income.recurrenceMonths ?? current.recurrenceMonths,
      comment: income.comment ?? current.comment,
      updatedAt: now,
    }

    this.items[index] = updated

    return updated
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)

    if (index < 0) {
      throw new Error('Income not found.')
    }

    this.items.splice(index, 1)
  }

  async listByMonth(yearMonth: string): Promise<Income[]> {
    return this.items.filter((income) => isActiveInMonth(income, yearMonth))
  }

  async sumByMonth(yearMonth: string): Promise<number> {
    const incomes = await this.listByMonth(yearMonth)

    return incomes.reduce((total, income) => total + income.amountCents, 0)
  }
}
