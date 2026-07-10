'use client'

import { type CSSProperties, type PointerEvent, type ReactNode, useCallback, useRef, useState } from 'react'

interface MccBorderGlowProps {
  children?: ReactNode
  className?: string
  /** Size of the outer glow spread in px. */
  glowRadius?: number
  /** Half-angle of visible cone at each end (degrees). Lower = tighter beam. */
  coneSpread?: number
}

function getCenter(el: HTMLElement): [number, number] {
  const { width, height } = el.getBoundingClientRect()
  return [width / 2, height / 2]
}

function edgeProximity(el: HTMLElement, x: number, y: number): number {
  const [cx, cy] = getCenter(el)
  const dx = x - cx, dy = y - cy
  const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity
  const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1)
}

function cursorAngle(el: HTMLElement, x: number, y: number): number {
  const [cx, cy] = getCenter(el)
  let deg = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90
  if (deg < 0) deg += 360
  return deg
}

/**
 * Animated conic-gradient border that sweeps toward the cursor + multi-layer box-shadow glow.
 * Adapted from UIable BorderGlow — simplified to MCC burgundy palette, no auto-sweep.
 * Wrap any `rounded-*` card with this component; it inherits border-radius via `rounded-[inherit]`.
 */
export function MccBorderGlow({ children, className = '', glowRadius = 32, coneSpread = 22 }: MccBorderGlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [angle, setAngle] = useState(45)
  const [proximity, setProximity] = useState(0)

  const onMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setProximity(edgeProximity(card, x, y))
    setAngle(cursorAngle(card, x, y))
  }, [])

  const p = proximity * 100
  const borderOpacity = hovered ? Math.max(0.1, (p - 25) / 75) : 0.1
  const glowOpacity   = hovered ? Math.max(0, (p - 20) / 80 * 0.7) : 0.04
  const deg = `${angle.toFixed(2)}deg`

  const borderMask = `conic-gradient(from ${deg} at center, black ${coneSpread}%, transparent ${coneSpread + 14}%, transparent ${100 - coneSpread - 14}%, black ${100 - coneSpread}%)`
  const glowMask   = `conic-gradient(from ${deg} at center, black 2.5%, transparent 11%, transparent 89%, black 97.5%)`
  const easing     = hovered ? 'opacity 0.2s ease-out' : 'opacity 0.65s ease-in-out'

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`relative ${className}`}
      style={{ transform: 'translate3d(0,0,0.01px)' }}
    >
      {/* Conic-gradient border layer */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          border: '1.5px solid transparent',
          background: [
            `conic-gradient(from ${deg} at center, rgba(122,30,44,0.9), rgba(184,134,46,0.65), rgba(122,30,44,0.9)) border-box`,
            'linear-gradient(white, white) padding-box',
          ].join(', '),
          opacity: borderOpacity,
          maskImage: borderMask,
          WebkitMaskImage: borderMask,
          transition: easing,
        }}
      />

      {/* Glow halo ring */}
      <span
        className="pointer-events-none absolute rounded-[inherit]"
        style={{
          inset: `${-glowRadius}px`,
          opacity: glowOpacity,
          maskImage: glowMask,
          WebkitMaskImage: glowMask,
          transition: easing,
        } as CSSProperties}
      >
        <span
          className="absolute rounded-[inherit]"
          style={{
            inset: `${glowRadius}px`,
            boxShadow: [
              'inset 0 0 0 1px rgba(122,30,44,0.85)',
              'inset 0 0 4px 0 rgba(122,30,44,0.55)',
              'inset 0 0 12px 0 rgba(122,30,44,0.3)',
              '0 0 4px 0 rgba(122,30,44,0.5)',
              '0 0 12px 0 rgba(122,30,44,0.25)',
              '0 0 30px 2px rgba(122,30,44,0.12)',
            ].join(', '),
          }}
        />
      </span>

      <div className="relative z-10">{children}</div>
    </div>
  )
}
