export interface Work {
  id: number
  title: string
  scenic_spot: string
  author: string
  dynasty: string
  description: string
  province: string
  latitude: number
  longitude: number
  category: string
  images: string[]
  created_at: string
  updated_at: string
}

export interface WorkFormData {
  title: string
  scenic_spot: string
  author: string
  dynasty: string
  description: string
  province: string
  latitude: number
  longitude: number
  category: string
  images: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  total?: number
}

export interface LoginResponse {
  token: string
}
