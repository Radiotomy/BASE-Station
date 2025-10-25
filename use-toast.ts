/**
 * Toast notification hook
 * Simple implementation for showing success/error messages
 */

import { useState, useCallback } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastState extends Toast {
  id: string
  visible: boolean
}

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const toast = useCallback((props: Toast) => {
    const id = `toast-${++toastCounter}`
    const duration = props.duration || 3000

    const newToast: ToastState = {
      ...props,
      id,
      visible: true
    }

    setToasts(prev => [...prev, newToast])

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)

    // Show browser notification as fallback
    if (typeof window !== 'undefined') {
      console.log(`[Toast ${props.variant || 'default'}]: ${props.title}`)
      if (props.description) {
        console.log(`  ${props.description}`)
      }
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return {
    toast,
    toasts,
    dismiss
  }
}
