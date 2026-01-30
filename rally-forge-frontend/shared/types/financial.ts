export type Currency = number

export type ValidationIssue = {
  field: string
  message: string
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  issues?: ValidationIssue[]
}
