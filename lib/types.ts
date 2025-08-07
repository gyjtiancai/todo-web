export interface User {
  id: string
  email: string
  name?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Todo {
  id: string
  userId: string
  title: string
  description?: string | null
  dueDate: Date | string
  dueTime?: string | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateTodoData {
  title: string
  description?: string
  dueDate: string
  dueTime?: string
}

export interface UpdateTodoData {
  title?: string
  description?: string
  dueDate?: string
  dueTime?: string
  completed?: boolean
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
} 