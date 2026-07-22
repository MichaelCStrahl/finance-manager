export interface ExpensesRepository {
  create(expense: CreateExpenseData): Promise<Expense>
  update(id: string, expense: UpdateExpenseData): Promise<Expense>
  delete(id: string): Promise<void>
  listByMonth(yearMonth: string): Promise<Expense[]>
  sumByMonth(yearMonth: string): Promise<number>
}
