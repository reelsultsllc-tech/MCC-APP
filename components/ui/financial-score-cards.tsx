"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import SpotlightCard from "@/components/ui/spotlight-card"

enum Strength {
  None     = "none",
  Weak     = "débil",
  Moderate = "moderado",
  Strong   = "fuerte",
}

interface FinancialScoreProps {
  title: string
  description: string
  initialScore?: number
}

interface FinancialScoreCardProps { children?: React.ReactNode }
interface FinancialScoreDisplayProps { value: Score; max: number }
interface FinancialScoreHalfCircleProps { value: Score; max: number }
interface FinancialScoreHeaderProps { title?: string; strength?: Strength }

type CounterContextType = { getNextIndex: () => number }
type Score = number | null
type StrengthColors = Record<Strength, string[]>

const data: FinancialScoreProps[] = [
  {
    title: "Score de Disputa",
    description: "Mide qué tan efectivas han sido tus disputas. Un score más alto refleja mejores resultados en la eliminación de ítems negativos.",
    initialScore: 42,
  },
  {
    title: "Progreso del Caso",
    description: "Refleja el avance general de tu reparación de crédito. Tu dedicación está dando resultados. Seguimos trabajando juntos.",
    initialScore: 83,
  },
  {
    title: "Fitness Financiero",
    description: "Evalúa tu salud financiera general. Obtén tu score en minutos, sin costo y sin impacto en tu historial crediticio.",
  },
]

class Utils {
  static easings = { easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)" }
  static circumference(r: number) { return 2 * Math.PI * r }
  static formatNumber(n: number) { return new Intl.NumberFormat("en-US").format(n) }
  static getStrength(score: Score, maxScore: number): Strength {
    if (!score) return Strength.None
    const p = score / maxScore
    if (p >= 0.8) return Strength.Strong
    if (p >= 0.4) return Strength.Moderate
    return Strength.Weak
  }
  static randomHash(length = 4) {
    const chars = "abcdef0123456789"
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(bytes).map((b) => chars[b % chars.length]).join("")
  }
  static randomInt(min = 0, max = 1) {
    const v = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32
    return Math.round(min + (max - min) * v)
  }
}

const CounterContext = createContext<CounterContextType | undefined>(undefined)
const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const counterRef = useRef(0)
  const getNextIndex = useCallback(() => counterRef.current++, [])
  return <CounterContext.Provider value={{ getNextIndex }}>{children}</CounterContext.Provider>
}
const useCounter = () => {
  const ctx = useContext(CounterContext)
  if (!ctx) throw new Error("useCounter must be inside CounterProvider")
  return ctx.getNextIndex
}

function FinancialScoreCard({ children }: FinancialScoreCardProps) {
  const getNextIndex = useCounter()
  const indexRef = useRef<number | null>(null)
  const timerRef = useRef(0)
  const [visible, setVisible] = useState(false)

  if (indexRef.current === null) indexRef.current = getNextIndex()

  useEffect(() => {
    timerRef.current = window.setTimeout(() => setVisible(true), 300 + indexRef.current! * 200)
    return () => clearTimeout(timerRef.current)
  }, [])

  if (!visible) return null

  return (
    <SpotlightCard
      className="w-full bg-white rounded-2xl border border-[#E7E2E1] animate-in fade-in slide-in-from-bottom-6 duration-700"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(36,16,20,0.04)' }}
      spotlightColor="rgba(184, 134, 46, 0.10)"
      radius={200}
    >
      <div className="p-5">{children}</div>
    </SpotlightCard>
  )
}

function FinancialScoreDisplay({ value, max }: FinancialScoreDisplayProps) {
  const hasValue = value !== null
  const digits = String(Math.floor(value ?? 0)).split("")
  const label = hasValue ? `de ${Utils.formatNumber(max)}` : "Sin score"

  return (
    <div className="absolute bottom-0 w-full text-center">
      <div className="font-lora font-extrabold tracking-tighter h-14 overflow-hidden relative" style={{ fontSize: '3rem', color: '#241014' }}>
        <div className="absolute inset-0">
          {hasValue
            ? digits.map((digit, i) => (
                <span key={i} className="inline-block animate-in slide-in-from-bottom-full duration-700"
                  style={{ animationDelay: `${400 + i * 100}ms` }}>
                  {digit}
                </span>
              ))
            : <span className="text-[#C4BEBC]">—</span>
          }
        </div>
      </div>
      <p className="text-[10px] text-[#9C9492] uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function FinancialScoreHalfCircle({ value, max }: FinancialScoreHalfCircleProps) {
  const strokeRef = useRef<SVGCircleElement>(null)
  const gradId = useRef(`mcc-grad-${Utils.randomHash()}`).current
  const radius = 45
  const dist = Utils.circumference(radius)
  const distHalf = dist / 2
  const strokeDasharray = `${distHalf} ${distHalf}`
  const distForValue = Math.min((value as number) / max, 1) * -distHalf
  const strokeDashoffset = value !== null ? distForValue : -(distHalf / 2)

  const strengthColors: StrengthColors = {
    [Strength.None]:     ["#D4CCCA", "#C4BEBC"],
    [Strength.Weak]:     ["#F4A0A8", "#9B3040", "#5C1520"],
    [Strength.Moderate]: ["#F0D49A", "#B8862E", "#8A5F1E"],
    [Strength.Strong]:   ["#A8D4A0", "#4F9A5C", "#3E6B2E"],
  }
  const colorStops = strengthColors[Utils.getStrength(value, max)]

  useEffect(() => {
    strokeRef.current?.animate(
      [
        { strokeDashoffset: "0", offset: 0 },
        { strokeDashoffset: "0", offset: 400 / 1400 },
        { strokeDashoffset: strokeDashoffset.toString() },
      ],
      { duration: 1400, easing: Utils.easings.easeInOut, fill: "forwards" }
    )
  }, [value, max, strokeDashoffset])

  return (
    <svg className="block mx-auto w-auto max-w-full h-28" viewBox="0 0 100 50" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          {colorStops.map((stop, i) => (
            <stop key={i} offset={`${(100 / (colorStops.length - 1)) * i}%`} stopColor={stop} />
          ))}
        </linearGradient>
      </defs>
      {/* strokeWidth reduced 10→7, strokeLinecap="round" on progress arc */}
      <g fill="none" strokeWidth="7" transform="translate(50, 50.5)">
        <circle stroke="#F0EEEC" r={radius} />
        <circle
          ref={strokeRef}
          stroke={`url(#${gradId})`}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          r={radius}
        />
      </g>
    </svg>
  )
}

function FinancialScoreHeader({ title, strength }: FinancialScoreHeaderProps) {
  const hasStrength = strength !== Strength.None

  const getBadgeStyle = (s: Strength) => {
    switch (s) {
      case Strength.Weak:     return "bg-[#F5E4E6] text-[#7A1E2C]"
      case Strength.Moderate: return "bg-[#F6EFDF] text-[#8A5F1E]"
      case Strength.Strong:   return "bg-[#E7EFDE] text-[#3E6B2E]"
      default: return ""
    }
  }
  const getDot = (s: Strength) => {
    switch (s) {
      case Strength.Weak:     return "#9B3040"
      case Strength.Moderate: return "#B8862E"
      case Strength.Strong:   return "#4F9A5C"
      default: return "#9C9492"
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* no truncate — let title wrap naturally */}
      <h2 className="text-sm font-semibold text-[#241014] leading-snug">{title}</h2>
      {hasStrength && strength && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${getBadgeStyle(strength)}`}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getDot(strength) }} />
          {strength}
        </span>
      )}
    </div>
  )
}

function FinancialScoreEmpty({ title, description }: { title: string; description: string }) {
  const [done, setDone] = useState(false)

  if (done) return null

  return (
    <div
      className="w-full bg-white rounded-2xl border border-dashed border-[#D4CCCA] animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: '700ms' }}
    >
      <div className="p-5 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#241014] leading-snug mb-0.5">{title}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0EEEC] text-[#9C9492]">
              Sin datos
            </span>
          </div>
          {/* Lock icon */}
          <div className="w-9 h-9 rounded-xl bg-[#F0EEEC] flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="#B0A4A2" strokeWidth="1.3"/>
              <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#B0A4A2" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Horizontal progress placeholder */}
        <div className="flex-1 flex flex-col justify-center py-3">
          <div className="h-1.5 w-full rounded-full bg-[#F0EEEC] mb-4 overflow-hidden">
            <div className="h-full w-0 rounded-full bg-[#D4CCCA]" />
          </div>
          <p className="text-xs text-[#9C9492] leading-relaxed">{description}</p>
        </div>

        {/* Compact CTA */}
        <button
          onClick={() => setDone(true)}
          className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-[#7A1E2C] border border-[#D4CCCA] hover:bg-[#F7F5F4] transition-colors"
        >
          Calcular gratis — 3 min →
        </button>
      </div>
    </div>
  )
}

function FinancialScore({ title, description, initialScore }: FinancialScoreProps) {
  const [score, setScore] = useState<Score>(initialScore ?? null)
  const hasScore = score !== null
  const max = 100
  const strength = Utils.getStrength(score, max)

  if (initialScore === undefined && !hasScore) {
    return <FinancialScoreEmpty title={title} description={description} />
  }

  return (
    <FinancialScoreCard>
      <FinancialScoreHeader title={title} strength={strength} />
      <div className="relative mb-5 animate-in fade-in duration-500">
        <FinancialScoreHalfCircle value={score} max={max} />
        <FinancialScoreDisplay value={score} max={max} />
      </div>
      <p className="text-[#9C9492] text-center mb-4 min-h-[3.5rem] text-xs leading-relaxed animate-in fade-in duration-500">
        {description}
      </p>
      <LiquidButton
        variant={hasScore ? "outline" : "default"}
        size="lg"
        onClick={() => { if (!hasScore) setScore(Utils.randomInt(0, max)) }}
        className="w-full text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {hasScore ? "Ver detalles →" : "Calcular mi score"}
      </LiquidButton>
    </FinancialScoreCard>
  )
}

export function FinancialScoreCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[820px]">
      <CounterProvider>
        {data.map((card, i) => (
          <FinancialScore key={i} {...card} />
        ))}
      </CounterProvider>
    </div>
  )
}
