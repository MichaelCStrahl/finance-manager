export interface IncomesRepository {
  create(income: CreateIncomeData): Promise<Income>
  update(id: string, income: UpdateIncomeData): Promise<Income>
  findById(id: string): Promise<Income | null>
  delete(id: string): Promise<void>
  listByMonth(yearMonth: string): Promise<Income[]>
  sumByMonth(yearMonth: string): Promise<number>
}
