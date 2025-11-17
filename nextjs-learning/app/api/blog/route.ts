import { db } from '@/lib/db';
import { blog, users } from '@/lib/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // 从请求中获取数据
    const body = await request.json();
    const { title, content, userId } = body;

    // 验证必填字段
    if (!title || !content || !userId) {
      return NextResponse.json(
        {
          errno: -1,
          message: '缺少必填字段：title、content 或 userId',
        },
        { status: 400 }
      );
    }

    // 检查用户是否存在，如果不存在则创建
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      // 用户不存在，创建一个新用户
      // 使用时间戳确保 username 和 email 的唯一性
      try {
        const timestamp = Date.now();
        await db.insert(users).values({
          id: userId,
          username: `user_${userId}_${timestamp}`,
          email: `${userId}_${timestamp}@example.com`,
          intro: '默认用户',
        });
      } catch (userError) {
        // 如果用户创建失败（可能是并发创建导致），再次检查用户是否存在
        const retryUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        // 如果仍然不存在，抛出错误
        if (retryUser.length === 0) {
          throw userError;
        }
        // 如果已经存在（并发创建成功），继续执行
      }
    }

    // 生成 blog id
    const id = `blog-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // 创建 blog 并存储到数据库
    const result = await db
      .insert(blog)
      .values({
        id,
        title,
        content,
        userId,
        thumbup: 0, // 默认点赞数为 0
      })
      .returning();

    // 成功返回
    return NextResponse.json({
      errno: 0,
      data: result[0],
    });
  } catch (error) {
    // 失败返回
    return NextResponse.json(
      {
        errno: -1,
        message: error instanceof Error ? error.message : '创建博客时发生未知错误',
      },
      { status: 500 }
    );
  }
}