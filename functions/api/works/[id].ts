import type { Env } from '../../lib/auth'
import { verifyToken } from '../../lib/auth'

// GET /api/works/:id
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context
  const id = (context.params as any).id

  try {
    const work = await env.DB.prepare('SELECT * FROM works WHERE id = ?')
      .bind(id)
      .first()

    if (!work) {
      return Response.json(
        { success: false, error: '作品未找到' },
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: {
        ...work,
        images: work.images ? JSON.parse(work.images as string) : [],
      },
    })
  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}

// PUT /api/works/:id
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { env } = context
  const id = (context.params as any).id

  const authHeader = context.request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token || !(await verifyToken(token, env.JWT_SECRET))) {
    return Response.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const body = await context.request.json() as any

    await env.DB.prepare(`
      UPDATE works SET
        title = ?, scenic_spot = ?, author = ?, dynasty = ?,
        description = ?, province = ?, latitude = ?, longitude = ?,
        category = ?, images = ?, updated_at = datetime('now')
      WHERE id = ?
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
      JSON.stringify(body.images || []),
      id
    ).run()

    return Response.json({ success: true })
  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}

// DELETE /api/works/:id
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env } = context
  const id = (context.params as any).id

  const authHeader = context.request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token || !(await verifyToken(token, env.JWT_SECRET))) {
    return Response.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    await env.DB.prepare('DELETE FROM works WHERE id = ?').bind(id).run()
    return Response.json({ success: true })
  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}
