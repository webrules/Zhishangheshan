import type { Env } from '../lib/auth'
import { verifyToken } from '../lib/auth'

// GET /api/works - List works with pagination and filters
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context
  const url = new URL(context.request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '12'), 2000)
  const search = url.searchParams.get('search') || ''
  const dynasty = url.searchParams.get('dynasty') || ''
  const province = url.searchParams.get('province') || ''
  const category = url.searchParams.get('category') || ''

  const offset = (page - 1) * limit
  let whereClause = '1=1'
  const params: string[] = []

  if (search) {
    whereClause += ' AND (title LIKE ? OR author LIKE ? OR scenic_spot LIKE ? OR description LIKE ?)'
    const s = `%${search}%`
    params.push(s, s, s, s)
  }
  if (dynasty) {
    whereClause += ' AND dynasty = ?'
    params.push(dynasty)
  }
  if (province) {
    whereClause += ' AND province = ?'
    params.push(province)
  }
  if (category) {
    whereClause += ' AND category = ?'
    params.push(category)
  }

  try {
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM works WHERE ${whereClause}`
    ).bind(...params).first<{ total: number }>()

    const works = await env.DB.prepare(
      `SELECT * FROM works WHERE ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all()

    // Parse images JSON for each work
    const data = works.results.map((w: any) => ({
      ...w,
      images: w.images ? JSON.parse(w.images) : [],
    }))

    return Response.json({
      success: true,
      data,
      total: countResult?.total || 0,
    })
  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}

// POST /api/works - Create a new work
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env } = context

  // Auth check
  const authHeader = context.request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token || !(await verifyToken(token, env.JWT_SECRET))) {
    return Response.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const body = await context.request.json() as any

    const result = await env.DB.prepare(`
      INSERT INTO works (title, scenic_spot, author, dynasty, description, province, latitude, longitude, category, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.title,
      body.scenic_spot,
      body.author || '',
      body.dynasty || '',
      body.description || '',
      body.province || '',
      body.latitude || 0,
      body.longitude || 0,
      body.category || '',
      JSON.stringify(body.images || [])
    ).run()

    return Response.json({
      success: true,
      data: { id: result.meta.last_row_id },
    })
  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}
