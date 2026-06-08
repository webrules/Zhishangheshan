const API_BASE = '/api'

export async function fetchWorks(params?: {
  page?: number
  limit?: number
  search?: string
  dynasty?: string
  province?: string
  category?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.search) searchParams.set('search', params.search)
  if (params?.dynasty) searchParams.set('dynasty', params.dynasty)
  if (params?.province) searchParams.set('province', params.province)
  if (params?.category) searchParams.set('category', params.category)

  const res = await fetch(`${API_BASE}/works?${searchParams}`)
  return res.json()
}

export async function fetchWork(id: number) {
  const res = await fetch(`${API_BASE}/works/${id}`)
  return res.json()
}

export async function createWork(data: Record<string, unknown>, token: string) {
  const res = await fetch(`${API_BASE}/works`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateWork(id: number, data: Record<string, unknown>, token: string) {
  const res = await fetch(`${API_BASE}/works/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteWork(id: number, token: string) {
  const res = await fetch(`${API_BASE}/works/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function login(password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  return res.json()
}

export async function importExcel(file: File, token: string) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  return res.json()
}
