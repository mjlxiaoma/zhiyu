import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 准备两个测试用户数据
    const testUsers = [
      {
        id: `user-${Date.now()}-1`,
        username: 'test_user_1',
        email: `test1-${Date.now()}@example.com`,
        image: 'https://example.com/avatar1.jpg',
        intro: '这是第一个测试用户的介绍',
      },
      {
        id: `user-${Date.now()}-2`,
        username: 'test_user_2',
        email: `test2-${Date.now()}@example.com`,
        image: 'https://example.com/avatar2.jpg',
        intro: '这是第二个测试用户的介绍',
      },
    ];

    // 使用 drizzle 插入数据
    const result = await db.insert(users).values(testUsers).returning();

    return NextResponse.json({
      success: true,
      message: '成功插入两个测试用户',
      data: result,
      count: result.length,
    });
  } catch (error) {
    // 处理可能的错误（如唯一约束冲突）
    return NextResponse.json(
      {
        success: false,
        message: '插入用户数据时发生错误',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

