'use client'

import { useEffect, useRef, useState } from 'react'

interface MccHoverBgProps {
  className?: string
  /** Color of the dot grid. Use rgba(255,255,255,…) on dark surfaces. */
  dotColor?: string
  /** Reveal circle radius in px. */
  radius?: number
  /** Opacity of the pattern when visible. */
  intensity?: number
  /** Size of each dot in px. */
  dotSize?: number
  /** Grid cell size in px (dot spacing). */
  dotSpacing?: number
}

/**
 * Smooth cursor-following dot-grid reveal. Adapted from UIable HoverBg.
 * Uses RAF + 0.08 lerp for buttery smooth interpolation, mask-image for reveal.
 * Must be a direct child of a `relative` container — reads parentElement for mouse events.
 */
export function MccHoverBg({
  className = '',
  dotColor = 'rgba(122,30,44,0.22)',
  radius = 220,
  intensity = 0.55,
  dotSize = 1.5,
  dotSpacing = 22,
}: MccHoverBgProps) {
  const glowRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const posRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, init: false })

  useEffect(() => {
    let rafId: number
    const el = glowRef.current
    const parent = el?.parentElement
    if (!parent) return

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      posRef.current.tx = e.clientX - rect.left
      posRef.current.ty = e.clientY - rect.top
      if (!posRef.current.init) {
        posRef.current.cx = posRef.current.tx
        posRef.current.cy = posRef.current.ty
        posRef.current.init = true
        setIsVisible(true)
      }
    }
    const onLeave = () => setIsVisible(false)
    const onEnter = () => setIsVisible(true)

    const tick = () => {
      if (el && posRef.current.init) {
        const { tx, ty, cx, cy } = posRef.current
        const nx = cx + (tx - cx) * 0.08
        const ny = cy + (ty - cy) * 0.08
        posRef.current.cx = nx
        posRef.current.cy = ny
        const mask = `radial-gradient(circle ${radius}px at ${nx}px ${ny}px, black, transparent)`
        el.style.setProperty('-webkit-mask-image', mask)
        el.style.setProperty('mask-image', mask)
      }
      rafId = requestAnimationFrame(tick)
    }

    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    parent.addEventListener('mouseenter', onEnter)
    rafId = requestAnimationFrame(tick)

    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
      parent.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafId)
    }
  }, [radius])

  return (
    <div
      ref={glowRef}
      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${className}`}
      style={{
        opacity: isVisible ? intensity : 0,
        WebkitMaskImage: `radial-gradient(circle ${radius}px at 50% 50%, black, transparent)`,
        maskImage: `radial-gradient(circle ${radius}px at 50% 50%, black, transparent)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle ${dotSize}px at ${dotSize}px ${dotSize}px, ${dotColor} 100%, transparent 0)`,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        }}
      />
    </div>
  )
}
