import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // 验证输入
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '邮箱和密码是必填项'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '密码至少需要6个字符'
      }, { status: 400 })
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '该邮箱已被注册'
      }, { status: 409 })
    }

    // 哈希密码
    const passwordHash = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { user }
    })

  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '注册失败，请稍后重试'
    }, { status: 500 })
  }
} 