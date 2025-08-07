import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTime(time: string): string {
  return time
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// 将任意日期格式转换为 YYYY-MM-DD 格式（用于 HTML date 输入框）
export function formatDateForInput(date: Date | string): string {
  if (typeof date === 'string') {
    // 如果是完整的 ISO 字符串，提取日期部分
    if (date.includes('T')) {
      return date.split('T')[0]
    }
    // 如果已经是 YYYY-MM-DD 格式，直接返回
    return date
  } else {
    // 如果是 Date 对象，转换为 YYYY-MM-DD 格式
    return date.toISOString().split('T')[0]
  }
}

// 安全地将任意日期格式转换为 Date 对象
export function parseDate(date: Date | string): Date {
  if (typeof date === 'string') {
    return new Date(date)
  } else {
    return date
  }
} 