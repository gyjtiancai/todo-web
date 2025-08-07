import { NextRequest, NextResponse } from 'next/server'
import { generateToken, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
  
  console.log('测试 API JWT_SECRET:', JWT_SECRET ? '已设置' : '未设置')
  
  // 生成一个测试 token
  const testToken = generateToken('test-user-id')
  console.log('生成的测试 token:', testToken)
  
  // 验证 token
  const payload = verifyToken(testToken)
  console.log('验证结果:', payload)
  
  return NextResponse.json({
    success: true,
    data: {
      jwtSecret: JWT_SECRET ? '已设置' : '未设置',
      token: testToken,
      payload: payload
    }
  })
} 