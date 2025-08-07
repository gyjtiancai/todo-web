import { NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

export async function POST() {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    data: { message: '登出成功' }
  })

  // 清除认证 Cookie
  response.cookies.delete('Authorization')

  return response
} 