// Edge Runtime 兼容的 JWT 实现
export function verifyTokenSync(token: string): { userId: string } | null {
  try {
    // 简单的 JWT 解析（仅用于开发环境）
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // 解码 payload
    const payload = JSON.parse(atob(parts[1]))
    
    // 检查是否过期
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    return { userId: payload.userId }
  } catch (error) {
    console.log('Edge Token 验证失败:', error)
    return null
  }
}