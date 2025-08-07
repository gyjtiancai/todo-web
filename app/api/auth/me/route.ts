import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('Authorization')?.value
    
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '未授权访问'
      }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '用户不存在'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { user }
    })

  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取用户信息失败'
    }, { status: 500 })
  }
} 