'use client'

import { useEffect, useState } from 'react'

export interface ActivityItem {
  id: number
  type: 'new' | 'success' | 'sent' | 'wait'
  text: string
  date: string
}

interface ActivityEchoStackProps {
  items: ActivityItem[]
  /** ms between each card entering */
  entranceInterval?: number
  /** ms between each card exiting */
  exitInterval?: number
  /** ms to hold all cards visible before collapsing */
  pauseBeforeExit?: number
  /** ms to hold at minimum before re-expanding */
  pauseBeforeEntrance?: number
}

const TYPE_CONFIG = {
  new:     { bg: '#F5E4E6', stroke: '#7A1E2C', label: 'Nuevo ítem' },
  success: { bg: '#E7EFDE', stroke: '#4F9A5C', label: 'Eliminado' },
  sent:    { bg: '#F6EFDF', stroke: '#B8862E', label: 'Carta enviada' },
  wait:    { bg: '#EDE7E6', stroke: '#57504E', label: 'En espera' },
} as const

function TypeIcon({ type }: { type: ActivityItem['type'] }) {
  const { bg, stroke } = TYPE_CONFIG[type]
  return (
    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: bg }}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        {type === 'new' && (
          <>
            <circle cx="8" cy="8" r="5.5" stroke={stroke} strokeWidth="1.4" />
            <path d="M8 5v3M8 9.5v.5" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
          </>
        )}
        {type === 'success' && (
          <>
            <circle cx="8" cy="8" r="5.5" stroke={stroke} strokeWidth="1.4" />
            <path d="M5.5 8l2 2 3-3" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {type === 'sent' && (
          <>
            <rect x="2" y="4" width="12" height="8.5" rx="1.2" stroke={stroke} strokeWidth="1.3" />
            <path d="M2 5.5l6 4 6-4" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {type === 'wait' && (
          <>
            <circle cx="8" cy="8" r="5.5" stroke={stroke} strokeWidth="1.4" />
            <path d="M8 5.5v2.8l2 1.2" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </div>
  )
}

function StackCard({ item }: { item: ActivityItem }) {
  return (
    <div
      className="w-full h-full bg-white rounded-xl border border-[#E7E2E1] p-3 flex flex-col justify-between"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start gap-2">
        <TypeIcon type={item.type} />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold" style={{ color: TYPE_CONFIG[item.type].stroke }}>
            {TYPE_CONFIG[item.type].label}
          </span>
          <p className="text-[11px] text-[#57504E] leading-relaxed mt-0.5 line-clamp-2">{item.text}</p>
        </div>
      </div>
      <p className="text-[10px] text-[#9C9492] mt-1.5">{item.date}</p>
    </div>
  )
}

/**
 * Adapted from UIable EchoStack — cycles through activity items as an animated card stack.
 * Cards slide up and stack with scale depth; oldest items shrink behind the newest.
 */
export function ActivityEchoStack({
  items,
  entranceInterval = 1800,
  exitInterval = 1000,
  pauseBeforeExit = 3200,
  pauseBeforeEntrance = 1400,
}: ActivityEchoStackProps) {
  const total = items.length
  const [visibleCount, setVisibleCount] = useState(0)
  const [revealing, setRevealing] = useState(true)

  useEffect(() => {
    if (total === 0) return
    let timer: ReturnType<typeof setTimeout>

    if (revealing) {
      if (visibleCount < total) {
        timer = setTimeout(
          () => setVisibleCount(n => n + 1),
          visibleCount === 0 ? 60 : entranceInterval
        )
      } else {
        timer = setTimeout(() => setRevealing(false), pauseBeforeExit)
      }
    } else {
      if (visibleCount > 2) {
        timer = setTimeout(() => setVisibleCount(n => n - 1), exitInterval)
      } else {
        timer = setTimeout(() => setRevealing(true), pauseBeforeEntrance)
      }
    }

    return () => clearTimeout(timer)
  }, [visibleCount, revealing, total, entranceInterval, exitInterval, pauseBeforeExit, pauseBeforeEntrance])

  if (total === 0) return null

  return (
    <div className="relative" style={{ height: 106 }}>
      {items.map((item, index) => {
        const visible = index < visibleCount
        const stackPos = visible ? visibleCount - 1 - index : 0
        const scale = 1 - stackPos * 0.05
        const ty = stackPos * 7

        return (
          <div
            key={item.id}
            className="absolute inset-0"
            style={{
              transform: visible
                ? `translateY(${ty}px) scale(${scale})`
                : 'translateY(110%) scale(0.88)',
              opacity: visible ? (stackPos > 2 ? 0 : 1 - stackPos * 0.18) : 0,
              zIndex: total - index,
              transition: 'transform 0.72s cubic-bezier(0.4,0,0.2,1), opacity 0.72s cubic-bezier(0.4,0,0.2,1)',
              transformOrigin: 'top center',
            }}
          >
            <StackCard item={item} />
          </div>
        )
      })}
    </div>
  )
}
