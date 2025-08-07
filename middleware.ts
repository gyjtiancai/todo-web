import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenSync } from './lib/jwt-edge'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('中间件执行:', pathname)
  console.log('中间件 JWT_SECRET:', process.env.JWT_SECRET)
  console.log('中间件 JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置')
  
  // 公开路由，不需要认证
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // 获取 JWT token
  const token = request.cookies.get('Authorization')?.value
  console.log('Token 存在:', !!token)
  
  // 如果是公开路由且用户已登录，重定向到主页
  if (isPublicRoute && token) {
    console.log('Token 内容:', token.substring(0, 20) + '...')
    const payload = verifyTokenSync(token)
    console.log('Token 验证结果:', payload)
    if (payload) {
      console.log('重定向到主页')
      return NextResponse.redirect(new URL('/', request.url))
    } else {
      console.log('Token 验证失败，但在公开路由，允许继续')
    }
  }
  
  // 如果是受保护的路由且用户未登录，重定向到登录页
  if (!isPublicRoute && !token) {
    console.log('未登录，重定向到登录页')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 验证 token 有效性
  if (!isPublicRoute && token) {
    const payload = verifyTokenSync(token)
    if (!payload) {
      console.log('Token 无效，清除 cookie 并重定向到登录页')
      // Token 无效，清除 cookie 并重定向到登录页
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('Authorization')
      return response
    }
  }
  
  console.log('中间件通过')
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 