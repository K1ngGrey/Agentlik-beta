// Backend barcha javoblarni shu umumiy formatda qaytaradi.
export interface ApiResult<T> {
  succeeded: boolean
  statusCode: number
  result: T | null
  errors: string[]
}
