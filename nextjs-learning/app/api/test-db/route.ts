import { testConnection } from '@/lib/test-connection';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: '测试连接时发生错误',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

