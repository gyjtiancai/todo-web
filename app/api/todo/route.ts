import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse, Todo, CreateTodoData } from '@/lib/types'

// 获取待办事项列表
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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const completed = searchParams.get('completed')

    // 构建查询条件
    const where: any = { userId: user.id }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      where.dueDate = {
        gte: startDate,
        lt: endDate
      }
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { dueTime: 'asc' }
      ]
    })

    return NextResponse.json<ApiResponse<Todo[]>>({
      success: true,
      data: todos
    })

  } catch (error) {
    console.error('获取待办事项错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取待办事项失败'
    }, { status: 500 })
  }
}

// 创建待办事项
export async function POST(request: NextRequest) {
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

    const { title, description, dueDate, dueTime }: CreateTodoData = await request.json()

    // 验证输入
    if (!title || !dueDate) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '标题和日期是必填项'
      }, { status: 400 })
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        dueTime,
        userId: user.id
      }
    })

    return NextResponse.json<ApiResponse<Todo>>({
      success: true,
      data: todo
    })

  } catch (error) {
    console.error('创建待办事项错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '创建待办事项失败'
    }, { status: 500 })
  }
}