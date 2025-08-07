import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { ApiResponse, AuthResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 验证输入
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '邮箱和密码是必填项'
      }, { status: 400 })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '邮箱或密码错误'
      }, { status: 401 })
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '邮箱或密码错误'
      }, { status: 401 })
    }

    // 生成 JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
    console.log('登录 API JWT_SECRET:', JWT_SECRET ? '已设置' : '未设置')
    const token = generateToken(user.id)

    // 创建响应
    const response = NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token
      }
    })

    // 设置 HttpOnly Cookie
    response.cookies.set('Authorization', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '登录失败，请稍后重试'
    }, { status: 500 })
  }
} 