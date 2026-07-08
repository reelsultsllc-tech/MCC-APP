"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import MccLogo from "@/components/MccLogo"

interface CursorWanderCardProps {
  cardholderName?: string
  className?: string
  cardNumber?: string
  expiryDate?: string
  height?: string | number
  width?: string | number
}

const CursorWanderCard: React.FC<CursorWanderCardProps> = ({
  cardholderName = "MARISOL VEGA",
  className = "",
  cardNumber = "•••• •••• •••• 4821",
  expiryDate = "07/28",
  height = "260px",
  width = "420px",
}) => {
  const [time, setTime] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const timeAnimationRef = useRef<number>(0)
  const rotationRef = useRef({ x: 8, y: 12, z: 2 })
  const rotationSpeedRef = useRef({ x: 0.15, y: 0.2, z: 0.03 })

  const animate = () => {
    if (!cardRef.current || isHovered) return
    rotationRef.current.x += rotationSpeedRef.current.x
    rotationRef.current.y += rotationSpeedRef.current.y
    rotationRef.current.z += rotationSpeedRef.current.z
    if (Math.abs(rotationRef.current.x) > 12) rotationSpeedRef.current.x *= -1
    if (Math.abs(rotationRef.current.y) > 12) rotationSpeedRef.current.y *= -1
    if (Math.abs(rotationRef.current.z) > 4) rotationSpeedRef.current.z *= -1
    cardRef.current.style.transform = `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg) rotateZ(${rotationRef.current.z}deg)`
    animationRef.current = requestAnimationFrame(animate)
  }

  const animateTime = () => {
    setTime((prev) => prev + 0.008)
    timeAnimationRef.current = requestAnimationFrame(animateTime)
  }

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const angleX = ((e.clientY - centerY) / (rect.height / 2)) * 30
      const angleY = (-(e.clientX - centerX) / (rect.width / 2)) * 30
      card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) rotateZ(${Math.min(Math.abs(angleX) + Math.abs(angleY), 15) / 8}deg)`
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
      cancelAnimationFrame(animationRef.current)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    timeAnimationRef.current = requestAnimationFrame(animateTime)
    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationRef.current)
      cancelAnimationFrame(timeAnimationRef.current)
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isHovered])

  const w = typeof width === 'number' ? `${width}px` : width
  const h = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={className}
      style={{ perspective: "2000px", width: w, height: h, position: 'relative' }}
    >
      <div
        ref={cardRef}
        style={{
          position: 'absolute',
          inset: 0,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.05s linear",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Card face */}
        <div
          className="absolute w-full h-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #1a0308 0%, #3a0d14 40%, #7A1E2C 75%, #9B3040 100%)",
            boxShadow: "0 25px 50px -12px rgba(122, 30, 44, 0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* Animated nebula glow — MCC burgundy/gold palette */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at ${50 + Math.sin(time * 0.5) * 25}% ${50 + Math.cos(time * 0.7) * 25}%, rgba(184, 134, 46, 0.25) 0%, transparent 60%),
                radial-gradient(circle at ${50 + Math.cos(time * 0.4) * 35}% ${50 + Math.sin(time * 0.3) * 35}%, rgba(122, 30, 44, 0.4) 0%, transparent 55%),
                radial-gradient(circle at ${50 + Math.sin(time * 0.6) * 30}% ${50 + Math.cos(time * 0.5) * 30}%, rgba(79, 154, 92, 0.15) 0%, transparent 50%)
              `,
            }}
          />

          {/* Holographic shimmer */}
          <div
            className="absolute inset-0 animate-holographic"
            style={{
              background: "linear-gradient(45deg, transparent 40%, rgba(255,220,180,0.08) 45%, rgba(255,220,180,0.16) 50%, rgba(255,220,180,0.08) 55%, transparent 60%)",
              backgroundSize: "200% 200%",
            }}
          />

          {/* Star field */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="mcc-stars-sm" />
            <div className="mcc-stars-md" />
          </div>

          {/* Top row: logo + chip area */}
          <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
            {/* MCC branding */}
            <div className="flex items-center gap-2">
              <MccLogo size={28} />
              <div className="text-white/80 text-xs font-lora leading-tight">
                <div>My Credit</div>
                <div className="text-[#F4A0A8]">Coffee</div>
              </div>
            </div>

            {/* Contactless icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="opacity-60 mt-0.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M12 6C8.69 6 6 8.69 6 12s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="white" opacity="0.8"/>
            </svg>
          </div>

          {/* EMV Chip */}
          <div className="absolute left-5 top-[72px]">
            <div
              className="w-10 h-7 rounded"
              style={{
                background: "linear-gradient(135deg, #d4a84b 0%, #b8862e 40%, #f0c060 60%, #b8862e 100%)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <div className="w-full h-full rounded grid grid-cols-3 grid-rows-3 gap-[1px] p-[3px] opacity-60">
                {Array.from({length: 9}).map((_, i) => (
                  <div key={i} className={`rounded-[1px] bg-[#8a5f1e]/40 ${i === 4 ? 'bg-transparent' : ''}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Card number */}
          <div className="absolute bottom-12 left-5 right-5">
            <p className="text-white/90 text-sm font-mono tracking-[0.25em]"
               style={{ textShadow: "0 0 8px rgba(184, 134, 46, 0.4)" }}>
              {cardNumber}
            </p>
          </div>

          {/* Bottom row: name + expiry */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Titular</p>
              <p className="text-white/85 text-xs font-medium tracking-wider">{cardholderName}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">Válida hasta</p>
              <p className="text-white/85 text-xs font-mono">{expiryDate}</p>
            </div>
          </div>

          {/* Premium badge top-right corner glow */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-20"
            style={{
              background: "radial-gradient(circle at top right, #B8862E 0%, transparent 70%)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes holographic {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        .animate-holographic { animation: holographic 6s ease infinite; }
        .mcc-stars-sm {
          position: absolute; width: 100%; height: 100%;
          background-image:
            radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 35% 60%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 55% 30%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 75% 80%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 85% 15%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 25% 85%, rgba(184,134,46,0.6), transparent),
            radial-gradient(1px 1px at 65% 50%, rgba(255,255,255,0.5), transparent);
          background-size: 100% 100%;
          opacity: 0.6;
        }
        .mcc-stars-md {
          position: absolute; width: 100%; height: 100%;
          background-image:
            radial-gradient(1.5px 1.5px at 40% 25%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 80% 60%, rgba(184,134,46,0.5), transparent),
            radial-gradient(1.5px 1.5px at 20% 70%, rgba(255,255,255,0.4), transparent);
          background-size: 100% 100%;
          opacity: 0.5;
          animation: drift 12s ease-in-out infinite alternate;
        }
        @keyframes drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(3px, 2px); }
        }
      `}</style>
    </div>
  )
}

export default CursorWanderCard
