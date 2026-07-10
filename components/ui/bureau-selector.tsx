'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Bureau {
  id: string
  name: string
  abbr: string
  disputes: number
  score: number
  scoreDelta: number
  color: string
}

const BUREAUS: Bureau[] = [
  { id: 'experian',    name: 'Experian',    abbr: 'EX', disputes: 2, score: 615, scoreDelta: +32, color: '#C41230' },
  { id: 'transunion',  name: 'TransUnion',  abbr: 'TU', disputes: 1, score: 608, scoreDelta: +25, color: '#002D9C' },
  { id: 'equifax',     name: 'Equifax',     abbr: 'EQ', disputes: 1, score: 601, scoreDelta: +20, color: '#E8171F' },
]

interface BureauSelectorProps {
  className?: string
  onSelect?: (bureauId: string) => void
}

function BureauRow({ b, isSelected, onSelect }: { b: Bureau; isSelected: boolean; onSelect: () => void }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={rowRef}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      onMouseMove={e => {
        if (!rowRef.current) return
        const rect = rowRef.current.getBoundingClientRect()
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex items-center gap-3 rounded-xl p-3.5 cursor-pointer transition-all duration-150 overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1E2C]',
        isSelected ? 'text-white' : 'hover:bg-[#F7F5F4] hover:shadow-sm'
      )}
    >
      {/* Spotlight glow for non-selected rows */}
      {!isSelected && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(circle 120px at ${pos.x}px ${pos.y}px, rgba(122,30,44,0.08), transparent)`,
          }}
        />
      )}

      {/* Animated spring highlight — deep dark with inner relief */}
      {isSelected && (
        <motion.div
          layoutId="bureau-highlight"
          className="absolute inset-0 rounded-xl"
          style={{
            background: '#241014',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 4px 12px rgba(36,16,20,0.3)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        />
      )}

      {/* Buró initials */}
      <div
        className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          background: isSelected ? 'rgba(255,255,255,0.12)' : '#F5E4E6',
          color: isSelected ? 'rgba(255,255,255,0.9)' : '#7A1E2C',
          boxShadow: isSelected ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : undefined,
        }}
      >
        {b.abbr}
      </div>

      {/* Name + disputes */}
      <div className="relative z-10 flex-1 min-w-0">
        <p className={cn('text-sm font-semibold leading-tight', isSelected ? 'text-white' : 'text-[#241014]')}>
          {b.name}
        </p>
        <p className={cn('text-xs', isSelected ? 'text-white/70' : 'text-[#9C9492]')}>
          {b.disputes} disputa{b.disputes !== 1 ? 's' : ''} activa{b.disputes !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Score */}
      <div className="relative z-10 text-right shrink-0">
        <p className={cn('text-sm font-bold font-lora', isSelected ? 'text-white' : 'text-[#241014]')}>
          {b.score}
        </p>
        <p className={cn('text-[10px]', isSelected ? 'text-[#6EE7A0]' : 'text-[#4F9A5C]')}>
          +{b.scoreDelta} pts
        </p>
      </div>

      {/* Checkmark */}
      <div className="relative z-10 w-5 h-5 shrink-0">
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="#7A1E2C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          )}
          {!isSelected && (
            <div className="w-5 h-5 rounded-full border-2 border-[#E7E2E1]" />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function BureauSelector({ className, onSelect }: BureauSelectorProps) {
  const [selected, setSelected] = useState('experian')
  const active = BUREAUS.find(b => b.id === selected)!

  function handleSelect(id: string) {
    setSelected(id)
    onSelect?.(id)
  }

  return (
    <div className={cn('bg-white rounded-2xl border border-[#E7E2E1] card-lift p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold font-lora text-[#241014]">Disputas por buró</p>
        <span className="text-[10px] text-[#9C9492] uppercase tracking-wide">Selecciona para ver detalle</span>
      </div>

      {/* Bureau tabs */}
      <div role="radiogroup" className="space-y-2 mb-4">
        {BUREAUS.map(b => (
          <BureauRow
            key={b.id}
            b={b}
            isSelected={selected === b.id}
            onSelect={() => handleSelect(b.id)}
          />
        ))}
      </div>

      {/* Active bureau detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="rounded-xl bg-[#F7F5F4] p-3.5"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-[#241014]">{active.name}</p>
            <span className="text-[10px] text-[#4F9A5C] font-semibold">+{active.scoreDelta} pts este mes</span>
          </div>
          <p className="text-xs text-[#57504E]">
            {active.disputes} disputa{active.disputes !== 1 ? 's' : ''} en proceso · Score actual: {active.score}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
