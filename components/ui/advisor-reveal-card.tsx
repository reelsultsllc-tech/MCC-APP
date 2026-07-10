'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AdvisorRevealCardProps {
  name: string
  role: string
  rating: number
  reviewCount: number
  initials: string
  suggestion: string
  benefits?: string[]
  onAction?: () => void
  className?: string
}

export function AdvisorRevealCard({
  name,
  role,
  rating,
  reviewCount,
  initials,
  suggestion,
  benefits = [],
  onAction,
  className,
}: AdvisorRevealCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[20px] border border-[rgba(80,25,35,0.08)] bg-white',
        className
      )}
      style={{ boxShadow: '0 2px 8px rgba(64,20,28,0.05), 0 10px 30px rgba(64,20,28,0.07)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Base layer */}
      <div className="p-4">
        <p className="text-[9px] font-semibold text-[#9C9492] uppercase tracking-widest mb-3">
          Sugerencia de tu asesora
        </p>

        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #B8862E 0%, #7A1E2C 100%)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-[13px] font-semibold font-lora text-[#241014]">{name}</p>
            <p className="text-[11px] text-[#57504E]">{role}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[#B8862E] text-[11px]">★</span>
              ))}
              <span className="text-[11px] font-medium text-[#241014] ml-1">{rating}</span>
              <span className="text-[11px] text-[#9C9492]"> ({reviewCount})</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#57504E] leading-snug line-clamp-2 mb-3">{suggestion}</p>

        <div className="flex items-center gap-2 pt-2.5 border-t border-[#F0EEEC]">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke="#B8862E" strokeWidth="1.1"/><path d="M6 4v2M6 7.5v.5" stroke="#B8862E" strokeWidth="1.1" strokeLinecap="round"/></svg>
          <p className="text-[10px] text-[#9C9492]">Pasa el cursor para ver la recomendación completa</p>
        </div>
      </div>

      {/* Burgundy reveal overlay — clips from avatar position */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #5C1520 0%, #7A1E2C 65%, #9B3040 100%)',
          willChange: 'clip-path',
        }}
        initial={{ clipPath: 'circle(0px at 43px 64px)' }}
        animate={{
          clipPath: hovered
            ? 'circle(600px at 43px 64px)'
            : 'circle(0px at 43px 64px)',
        }}
        transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white text-sm font-bold mb-2.5 shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            {initials}
          </div>

          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">
            Tu asesora
          </p>
          <p className="font-lora text-base font-medium text-white mb-0">{name}</p>
          <p className="text-white/60 text-[11px] mb-1.5">{role}</p>

          <div className="flex items-center gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[#F4C26A] text-xs">★</span>
            ))}
            <span className="text-white/60 text-xs ml-1">
              {rating} ({reviewCount} reseñas)
            </span>
          </div>

          <p className="text-white/80 text-xs leading-snug mb-3 flex-1">{suggestion}</p>

          {benefits.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    className="mt-0.5 shrink-0"
                  >
                    <circle cx="6.5" cy="6.5" r="5.5" fill="rgba(255,255,255,0.18)" />
                    <path
                      d="M4 6.5l1.8 1.8L9 4.5"
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-white/70 text-[11px] leading-snug">{b}</p>
                </motion.div>
              ))}
            </div>
          )}

          <button
            onClick={onAction}
            className="w-full py-2.5 rounded-xl bg-white text-[#7A1E2C] font-semibold text-sm hover:bg-white/90 transition-colors mt-auto"
          >
            Solicitar seguimiento
          </button>
        </div>
      </motion.div>
    </div>
  )
}
