'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, Check, Edit, Trash2, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Todo, CreateTodoData, UpdateTodoData } from '@/lib/types'
import { formatDate, getTodayString, formatDateForInput, parseDate } from '@/lib/utils'

import { ToastManager, useToast } from '@/components/ui/toast'



export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(getTodayString()) // 当前选择的日期
  const [newTodo, setNewTodo] = useState<CreateTodoData>({
    title: '',
    description: '',
    dueDate: selectedDate,
    dueTime: ''
  })
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const { toasts, removeToast, showSuccess, showError } = useToast()

  // 获取用户信息
  useEffect(() => {
    fetchUserInfo()
  }, [])

  // 获取待办事项
  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user, selectedDate]) // 当选择的日期改变时重新获取

  // 当选择的日期改变时，更新新待办的默认日期
  useEffect(() => {
    setNewTodo(prev => ({
      ...prev,
      dueDate: selectedDate
    }))
  }, [selectedDate])



  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/todo?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setTodos(data.data)
      }
    } catch (error) {
      console.error('获取待办事项失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.title.trim()) return

    try {
      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })

      if (response.ok) {
        const data = await response.json()
        const updatedTodos = [...todos, data.data]
        setTodos(updatedTodos)
        
        showSuccess('待办已添加', `"${data.data.title}" 已添加到您的待办列表`)
        
        setNewTodo({
          title: '',
          description: '',
          dueDate: selectedDate,
          dueTime: ''
        })
        setShowAddForm(false)
      } else {
        showError('添加失败', '无法添加待办事项，请稍后重试')
      }
    } catch (error) {
      console.error('添加待办事项失败:', error)
    }
  }

  const handleUpdateTodo = async (todo: Todo, updates: UpdateTodoData) => {
    try {
      const response = await fetch(`/api/todo/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const data = await response.json()
        const updatedTodos = todos.map(t => t.id === todo.id ? data.data : t)
        setTodos(updatedTodos)
        
        showSuccess('待办已更新', `"${data.data.title}" 已更新`)
        setEditingTodo(null)
      } else {
        showError('更新失败', '无法更新待办事项，请稍后重试')
      }
    } catch (error) {
      console.error('更新待办事项失败:', error)
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todo/${todoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const deletedTodo = todos.find(t => t.id === todoId)
        const updatedTodos = todos.filter(t => t.id !== todoId)
        setTodos(updatedTodos)
        
        showSuccess('待办已删除', `"${deletedTodo?.title}" 已从您的待办列表中删除`)
      } else {
        showError('删除失败', '无法删除待办事项，请稍后重试')
      }
    } catch (error) {
      console.error('删除待办事项失败:', error)
    }
  }

  const handleToggleComplete = async (todo: Todo) => {
    await handleUpdateTodo(todo, { completed: !todo.completed })
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast 消息管理器 */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">每日待办</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              你好，{user?.name || user?.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-xl font-semibold">
              {formatDate(new Date(selectedDate))} 的待办事项
              {selectedDate === getTodayString() && (
                <span className="ml-2 text-sm font-normal text-green-600">(今天)</span>
              )}
            </h2>
            
            {/* 日期选择器 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevDate = new Date(selectedDate)
                  prevDate.setDate(prevDate.getDate() - 1)
                  setSelectedDate(prevDate.toISOString().split('T')[0])
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextDate = new Date(selectedDate)
                  nextDate.setDate(nextDate.getDate() + 1)
                  setSelectedDate(nextDate.toISOString().split('T')[0])
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* 快速跳转到今天 */}
              {selectedDate !== getTodayString() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(getTodayString())}
                >
                  今天
                </Button>
              )}
            </div>
          </div>
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加待办
          </Button>
        </div>

        {/* 添加待办表单 */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">添加新待办</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTodo} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">标题</label>
                      <Input
                        value={newTodo.title}
                        onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                        placeholder="请输入待办事项标题"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">描述</label>
                      <Input
                        value={newTodo.description}
                        onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                        placeholder="请输入描述（可选）"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">日期</label>
                        <Input
                          type="date"
                          value={newTodo.dueDate}
                          onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">时间</label>
                        <Input
                          type="time"
                          value={newTodo.dueTime}
                          onChange={(e) => setNewTodo({...newTodo, dueTime: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">添加</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 待办事项列表 */}
        <div className="space-y-4">
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={todo.completed ? 'opacity-75' : ''}>
                  <CardContent className="p-4">
                    {editingTodo?.id === todo.id ? (
                      <EditTodoForm
                        todo={todo}
                        onSave={(updates) => handleUpdateTodo(todo, updates)}
                        onCancel={() => setEditingTodo(null)}
                      />
                    ) : (
                      <div className="flex items-start gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleComplete(todo)}
                          className="mt-1"
                        >
                          <Check className={`w-4 h-4 ${todo.completed ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <div className="flex-1">
                          <h3 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={`text-sm text-muted-foreground mt-1 ${todo.completed ? 'line-through' : ''}`}>
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{formatDate(parseDate(todo.dueDate))}</span>
                            {todo.dueTime && <span>{todo.dueTime}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTodo(todo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {todos.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {selectedDate === getTodayString() ? (
                <div>
                  <p className="text-lg mb-2">今天还没有待办事项</p>
                  <p className="text-sm">点击"添加待办"开始规划您的一天吧！</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-2">{formatDate(new Date(selectedDate))} 没有待办事项</p>
                  <p className="text-sm">这一天很轻松，或者您可以添加一些计划</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 编辑待办表单组件
function EditTodoForm({ todo, onSave, onCancel }: {
  todo: Todo
  onSave: (updates: UpdateTodoData) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: todo.title,
    description: todo.description || '',
    dueDate: formatDateForInput(todo.dueDate),
    dueTime: todo.dueTime || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">标题</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="请输入待办事项标题"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">描述</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="请输入描述（可选）"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">日期</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">时间</label>
          <Input
            type="time"
            value={formData.dueTime}
            onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">保存</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  )
} 