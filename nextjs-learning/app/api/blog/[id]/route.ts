import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { blog } from '@/lib/schema'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const blogId = params?.id ?? new URL(request.url).pathname.split('/').pop()

  if (!blogId) {
    return NextResponse.json(
      { errno: -1, message: '缺少博客 ID' },
      { status: 400 }
    )
  }

  try {
    const deleted = await db.delete(blog).where(eq(blog.id, blogId)).returning()

    if (deleted.length === 0) {
      return NextResponse.json(
        { errno: -1, message: '博客不存在或已删除' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      errno: 0,
      data: deleted[0],
    })
  } catch (error) {
    return NextResponse.json(
      {
        errno: -1,
        message: error instanceof Error ? error.message : '删除博客失败',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const blogId = params?.id ?? new URL(request.url).pathname.split('/').pop()

  if (!blogId) {
    return NextResponse.json(
      { errno: -1, message: '缺少博客 ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    const title = body?.title?.trim()
    const content = body?.content?.trim()

    if (!title || !content) {
      return NextResponse.json(
        { errno: -1, message: '缺少标题或内容' },
        { status: 400 }
      )
    }

    const [updatedBlog] = await db
      .update(blog)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(blog.id, blogId))
      .returning()

    if (!updatedBlog) {
      return NextResponse.json(
        { errno: -1, message: '博客不存在或已删除' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      errno: 0,
      data: updatedBlog,
    })
  } catch (error) {
    return NextResponse.json(
      {
        errno: -1,
        message: error instanceof Error ? error.message : '更新博客失败',
      },
      { status: 500 }
    )
  }
}


