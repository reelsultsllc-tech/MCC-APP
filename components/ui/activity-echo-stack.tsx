'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface ActivityItem {
  id: number
  type: 'new' | 'success' | 'sent' | 'wait'
  text: string
  date: string
}

interface ActivityEchoStackProps {
  items: ActivityItem[]
  /** ms each card stays visible before advancing */
  interval?: number
}

const TYPE_CONFIG = {
  new:     { bg: '#F5E4E6', stroke: '#7A1E2C', border: '#7A1E2C', label: 'Nuevo ítem' },
  success: { bg: '#E7EFDE', stroke: '#4F9A5C', border: '#4F9A5C', label: 'Eliminado' },
  sent:    { bg: '#F6EFDF', stroke: '#B8862E', border: '#B8862E', label: 'Carta enviada' },
  wait:    { bg: '#EDE7E6', stroke: '#57504E', border: '#9C9492', label: 'En espera' },
} as const

function TypeIcon({ type }: { type: ActivityItem['type'] }) {
  const { bg, stroke } = TYPE_CONFIG[type]
  return (
    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: bg }}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
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

function ActivityCard({ item }: { item: ActivityItem }) {
  const cfg = TYPE_CONFIG[item.type]
  return (
    <div
      className="h-full bg-white rounded-xl border border-[#E7E2E1] overflow-hidden flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Colored top accent bar */}
      <div className="h-[3px] w-full shrink-0" style={{ background: cfg.border }} />
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TypeIcon type={item.type} />
            <span className="text-[10px] font-semibold" style={{ color: cfg.stroke }}>
              {cfg.label}
            </span>
            <span className="ml-auto text-[10px] text-[#B0A4A2] shrink-0">{item.date}</span>
          </div>
          <p className="text-[11px] text-[#57504E] leading-relaxed line-clamp-3">{item.text}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * One activity card visible at a time, sliding up as new ones arrive.
 * Uses framer-motion AnimatePresence for clean enter/exit without overflow issues.
 */
export function ActivityEchoStack({ items, interval = 4200 }: ActivityEchoStackProps) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setIdx(prev => (prev + 1) % items.length)
    }, interval)
    return () => clearInterval(timer)
  }, [items.length, interval])

  return (
    <div>
      {/* Card viewport — overflow hidden clips the slide animation */}
      <div className="relative overflow-hidden rounded-xl" style={{ height: 108 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={idx}
            initial={{ y: '105%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-105%', opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <ActivityCard item={items[idx]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pill dots — show position in feed */}
      <div className="flex items-center gap-1 mt-2 px-0.5">
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-400"
            style={{
              height: 3,
              width: i === idx ? 14 : 4,
              background: i === idx ? '#7A1E2C' : '#D4CCCA',
            }}
          />
        ))}
      </div>
    </div>
  )
}
