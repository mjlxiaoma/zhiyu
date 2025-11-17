import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { blog } from '@/lib/schema'

export async function POST(
  request: NextRequest,
  { params }: { params?: { id?: string } }
) {
  const pathnameSegments = request.nextUrl.pathname.split('/').filter(Boolean)
  const idFromPath = pathnameSegments[pathnameSegments.length - 1]
  const id = params?.id ?? idFromPath

  if (!id) {
    return NextResponse.json(
      {
        errno: -1,
        message: '缺少博客 ID',
      },
      { status: 400 }
    )
  }

  try {
    const [currentBlog] = await db
      .select({
        thumbup: blog.thumbup,
      })
      .from(blog)
      .where(eq(blog.id, id))
      .limit(1)

    if (!currentBlog) {
      return NextResponse.json(
        {
          errno: -1,
          message: '博客不存在',
        },
        { status: 404 }
      )
    }

    const nextThumbup = currentBlog.thumbup + 1
    // 更新数据库数据
    const [updatedBlog] = await db
      .update(blog)
      .set({
        thumbup: nextThumbup,
        updatedAt: new Date(),
      })
      .where(eq(blog.id, id))
      .returning({
        id: blog.id,
        thumbup: blog.thumbup,
      })

    return NextResponse.json({
      errno: 0,
      data: updatedBlog,
    })
  } catch (error) {
    return NextResponse.json(
      {
        errno: -1,
        message: error instanceof Error ? error.message : '点赞失败',
      },
      { status: 500 }
    )
  }
}