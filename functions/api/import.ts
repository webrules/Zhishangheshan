import type { Env } from '../lib/auth'
import { verifyToken } from '../lib/auth'

// POST /api/import - Import data from JSON (Excel parsed on client side)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env } = context

  const authHeader = context.request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token || !(await verifyToken(token, env.JWT_SECRET))) {
    return Response.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const body = await context.request.json() as {
      mode?: 'append' | 'replace'
      data: Array<{
        title: string
        scenic_spot: string
        author?: string
        dynasty?: string
        description?: string
        province?: string
        latitude?: number
        longitude?: number
        category?: string
        images?: string[]
      }>
    }

    if (!body.data || !Array.isArray(body.data)) {
      return Response.json(
        { success: false, error: '数据格式错误，需要 data 数组' },
        { status: 400 }
      )
    }

    // If replace mode, clear existing data
    if (body.mode === 'replace') {
      await env.DB.prepare('DELETE FROM works').run()
    }

    let count = 0
    // Batch insert using D1 batch API (max 100 per batch to stay within limits)
    const validItems = body.data.filter((item) => item.title && item.scenic_spot)
    const BATCH_SIZE = 50

    for (let i = 0; i < validItems.length; i += BATCH_SIZE) {
      const batch = validItems.slice(i, i + BATCH_SIZE)
      const statements = batch.map((item) =>
        env.DB.prepare(`
          INSERT INTO works (title, scenic_spot, author, dynasty, description, province, latitude, longitude, category, images)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.title,
          item.scenic_spot,
          item.author || '',
          item.dynasty || '',
          item.description || '',
          item.province || '',
          item.latitude || 0,
          item.longitude || 0,
          item.category || '',
          JSON.stringify(item.images || [])
        )
      )
      await env.DB.batch(statements)
      count += batch.length
    }

    return Response.json({
      success: true,
      data: { count },
    })
  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}
