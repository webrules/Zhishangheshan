import type { Env } from '../../lib/auth'
import { createToken } from '../../lib/auth'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env } = context

  try {
    const body = await context.request.json() as { password?: string }
    const password = body?.password

    if (!password || password !== env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      )
    }

    const token = await createToken({ role: 'admin' }, env.JWT_SECRET)

    return Response.json({
      success: true,
      data: { token },
    })
  } catch {
    return Response.json(
      { success: false, error: '请求格式错误' },
      { status: 400 }
    )
  }
}
