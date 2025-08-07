import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { User } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
console.log('JWT_SECRET 配置:', JWT_SECRET ? '已设置' : '未设置')

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    console.log('验证 Token，使用密钥:', JWT_SECRET ? '已设置' : '未设置')
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    console.log('Token 验证成功，用户ID:', payload.userId)
    return payload
  } catch (error) {
    console.log('Token 验证失败，错误:', error instanceof Error ? error.message : error)
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  return user
} 