'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
  duration?: number
}

export default function Toast({ message, onDismiss, duration = 2200 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 10)
    // Animate out then dismiss
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onDismiss])

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
      <div
        className={`
          bg-[#241014] text-white text-sm px-5 py-3 rounded-xl shadow-xl
          transition-all duration-300 pointer-events-auto max-w-xs text-center
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {message}
      </div>
    </div>
  )
}
