import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse, Todo, UpdateTodoData } from '@/lib/types'

// 更新待办事项
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const updateData: UpdateTodoData = await request.json()

    // 验证待办事项是否属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!existingTodo) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '待办事项不存在或无权限访问'
      }, { status: 404 })
    }

    // 构建更新数据
    const data: any = {}
    if (updateData.title !== undefined) data.title = updateData.title
    if (updateData.description !== undefined) data.description = updateData.description
    if (updateData.dueDate !== undefined) data.dueDate = new Date(updateData.dueDate)
    if (updateData.dueTime !== undefined) data.dueTime = updateData.dueTime
    if (updateData.completed !== undefined) data.completed = updateData.completed

    const todo = await prisma.todo.update({
      where: { id },
      data
    })

    return NextResponse.json<ApiResponse<Todo>>({
      success: true,
      data: todo
    })

  } catch (error) {
    console.error('更新待办事项错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '更新待办事项失败'
    }, { status: 500 })
  }
}

// 删除待办事项
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // 验证待办事项是否属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!existingTodo) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '待办事项不存在或无权限访问'
      }, { status: 404 })
    }

    await prisma.todo.delete({
      where: { id }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: '删除成功' }
    })

  } catch (error) {
    console.error('删除待办事项错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '删除待办事项失败'
    }, { status: 500 })
  }
} 