'use client'

import {
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type MouseEventHandler,
  type PropsWithChildren,
} from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps extends PropsWithChildren {
  className?: string
  style?: CSSProperties
  /** The radial glow color. Default is a warm burgundy at low opacity for white cards. */
  spotlightColor?: string
  /** Radius of the spotlight circle in px. */
  radius?: number
}

/**
 * Wrapper card with a mouse-following radial glow overlay (extracted from UIable SpotlightCard).
 * Overlay sits in DOM BEFORE children so siblings paint on top — no z-index needed.
 */
const SpotlightCard: FC<SpotlightCardProps> = ({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(122, 30, 44, 0.07)',
  radius = 220,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn('relative overflow-hidden', className)}
      style={style}
    >
      {/* Spotlight overlay — behind children via DOM order */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent)`,
        }}
      />
      {children}
    </div>
  )
}

export default SpotlightCard
