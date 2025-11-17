import { db } from '@/lib/db';
import { blog, users } from '@/lib/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    // 先查询是否存在用户，如果没有则创建一个
    let existingUsers = await db.select().from(users).limit(1);
    
    let userId: string;
    
    if (existingUsers.length === 0) {
      // 如果没有用户，先创建一个测试用户
      const newUser = await db.insert(users).values({
        id: `user-${Date.now()}`,
        username: `test_user_${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        intro: '用于测试博客的默认用户',
      }).returning();
      userId = newUser[0].id;
    } else {
      // 使用第一个存在的用户
      userId = existingUsers[0].id;
    }

    // 准备三条测试博客数据
    const testBlogs = [
      {
        id: `blog-${Date.now()}-1`,
        title: '我的第一篇博客',
        content: '这是第一篇博客的内容。在这里可以分享你的想法、经验和见解。',
        thumbup: 0,
        userId: userId,
      },
      {
        id: `blog-${Date.now()}-2`,
        title: '技术学习心得',
        content: '今天学习了 Next.js 和 Drizzle ORM，感觉非常有趣。这些现代工具让开发变得更加高效。',
        thumbup: 5,
        userId: userId,
      },
      {
        id: `blog-${Date.now()}-3`,
        title: '关于数据库设计的思考',
        content: '良好的数据库设计是应用成功的基础。外键关系、索引优化、数据类型选择都很重要。',
        thumbup: 12,
        userId: userId,
      },
    ];

    // 使用 drizzle 插入数据
    const result = await db.insert(blog).values(testBlogs).returning();

    return NextResponse.json({
      success: true,
      message: '成功插入三条测试博客',
      data: result,
      count: result.length,
      userId: userId,
    });
  } catch (error) {
    // 处理可能的错误（如外键约束冲突）
    return NextResponse.json(
      {
        success: false,
        message: '插入博客数据时发生错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

