export interface IncomesRepository {
  create(income: CreateIncomeData): Promise<Income>
  update(id: string, income: UpdateIncomeData): Promise<Income>
  delete(id: string): Promise<void>
  listByMonth(yearMonth: string): Promise<Income[]>
  sumByMonth(yearMonth: string): Promise<number>
}
