'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: () => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
}

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500'
}

export function Toast({ type, title, message, duration = 5000, onClose }: ToastProps) {
  const Icon = toastIcons[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 max-w-sm ${toastStyles[type]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyles[type]}`} />
        <div className="flex-1 min-w-0">
          <div className="font-medium">{title}</div>
          {message && <div className="text-sm mt-1 opacity-90">{message}</div>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Toast 管理器
interface ToastManagerProps {
  toasts: Array<{ id: string } & ToastProps>
  removeToast: (id: string) => void
}

export function ToastManager({ toasts, removeToast }: ToastManagerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// 使用示例 Hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string } & ToastProps>>([])

  const addToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id, onClose: () => removeToast(id) }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }

  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }

  return {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
} 