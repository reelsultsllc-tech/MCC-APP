"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { LiquidCard, CardContent, CardHeader } from "@/components/ui/liquid-glass-card"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

// Types
enum Strength {
  None = "none",
  Weak = "débil",
  Moderate = "moderado",
  Strong = "fuerte",
}

interface FinancialScoreProps {
  title: string
  description: string
  initialScore?: number
}

interface FinancialScoreCardProps {
  children?: React.ReactNode
}

interface FinancialScoreDisplayProps {
  value: Score
  max: number
}

interface FinancialScoreHalfCircleProps {
  value: Score
  max: number
}

interface FinancialScoreHeaderProps {
  title?: string
  strength?: Strength
}

type CounterContextType = { getNextIndex: () => number }
type Score = number | null
type StrengthColors = Record<Strength, string[]>

// MCC-adapted data (Spanish, credit repair context)
const data: FinancialScoreProps[] = [
  {
    title: "Score de Disputa",
    description:
      "Mide qué tan efectivas han sido tus disputas. Un score más alto refleja mejores resultados en la eliminación de ítems negativos.",
    initialScore: 42,
  },
  {
    title: "Progreso del Caso",
    description:
      "Refleja el avance general de tu reparación de crédito. Tu dedicación está dando resultados. Seguimos trabajando juntos.",
    initialScore: 83,
  },
  {
    title: "Fitness Financiero",
    description:
      "Evalúa tu salud financiera general. Obtén tu score en minutos, sin costo y sin impacto en tu historial crediticio.",
  },
]

// Utils
class Utils {
  static easings = { easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)" }

  static circumference(r: number): number {
    return 2 * Math.PI * r
  }

  static formatNumber(n: number) {
    return new Intl.NumberFormat("en-US").format(n)
  }

  static getStrength(score: Score, maxScore: number): Strength {
    if (!score) return Strength.None
    const percent = score / maxScore
    if (percent >= 0.8) return Strength.Strong
    if (percent >= 0.4) return Strength.Moderate
    return Strength.Weak
  }

  static randomHash(length = 4): string {
    const chars = "abcdef0123456789"
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(bytes).map((b) => chars[b % chars.length]).join("")
  }

  static randomInt(min = 0, max = 1): number {
    const value = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32
    return Math.round(min + (max - min) * value)
  }
}

// Context
const CounterContext = createContext<CounterContextType | undefined>(undefined)

const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const counterRef = useRef(0)
  const getNextIndex = useCallback(() => counterRef.current++, [])
  return <CounterContext.Provider value={{ getNextIndex }}>{children}</CounterContext.Provider>
}

const useCounter = () => {
  const context = useContext(CounterContext)
  if (!context) throw new Error("useCounter must be used within a CounterProvider")
  return context.getNextIndex
}

// Sub-components
function FinancialScoreCard({ children }: FinancialScoreCardProps) {
  const getNextIndex = useCounter()
  const indexRef = useRef<number | null>(null)
  const animationRef = useRef(0)
  const [appearing, setAppearing] = useState(false)

  if (indexRef.current === null) {
    indexRef.current = getNextIndex()
  }

  useEffect(() => {
    const delay = 300 + indexRef.current! * 200
    animationRef.current = window.setTimeout(() => setAppearing(true), delay)
    return () => clearTimeout(animationRef.current)
  }, [])

  if (!appearing) return null

  return (
    <LiquidCard className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <CardContent className="p-5">{children}</CardContent>
    </LiquidCard>
  )
}

function FinancialScoreDisplay({ value, max }: FinancialScoreDisplayProps) {
  const hasValue = value !== null
  const digits = String(Math.floor(value!)).split("")
  const maxFormatted = Utils.formatNumber(max)
  const label = hasValue ? `de ${maxFormatted}` : "Sin score"

  return (
    <div className="absolute bottom-0 w-full text-center">
      <div className="text-4xl font-medium h-12 overflow-hidden relative">
        <div className="absolute inset-0 opacity-0">
          <div className="inline-block">0</div>
        </div>
        <div className="absolute inset-0">
          {hasValue &&
            digits.map((digit, i) => (
              <span
                key={i}
                className="inline-block animate-in slide-in-from-bottom-full duration-700"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                {digit}
              </span>
            ))}
        </div>
      </div>
      <div className="text-sm text-[#9C9492] uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}

function FinancialScoreHalfCircle({ value, max }: FinancialScoreHalfCircleProps) {
  const strokeRef = useRef<SVGCircleElement>(null)
  const gradIdRef = useRef(`mcc-grad-${Utils.randomHash()}`)
  const gradId = gradIdRef.current
  const radius = 45
  const dist = Utils.circumference(radius)
  const distHalf = dist / 2
  const distFourth = distHalf / 2
  const strokeDasharray = `${distHalf} ${distHalf}`
  const distForValue = Math.min((value as number) / max, 1) * -distHalf
  const strokeDashoffset = value !== null ? distForValue : -distFourth
  const strength = Utils.getStrength(value, max)

  // MCC color palette for strength levels
  const strengthColors: StrengthColors = {
    [Strength.None]: ["#C4BEBC", "#9C9492"],
    [Strength.Weak]: ["#F4A0A8", "#9B3040", "#5C1520"],
    [Strength.Moderate]: ["#F0D49A", "#B8862E", "#8A5F1E"],
    [Strength.Strong]: ["#A8D4A0", "#4F9A5C", "#3E6B2E"],
  }
  const colorStops = strengthColors[strength]

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
    <svg className="block mx-auto w-auto max-w-full h-36" viewBox="0 0 100 50" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          {colorStops.map((stop, i) => (
            <stop key={i} offset={`${(100 / (colorStops.length - 1)) * i}%`} stopColor={stop} />
          ))}
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="10" transform="translate(50, 50.5)">
        <circle className="stroke-[#E7E2E1]" r={radius} />
        <circle
          ref={strokeRef}
          stroke={`url(#${gradId})`}
          strokeDasharray={strokeDasharray}
          r={radius}
        />
      </g>
    </svg>
  )
}

function FinancialScoreHeader({ title, strength }: FinancialScoreHeaderProps) {
  const hasStrength = strength !== Strength.None

  const getBadgeStyle = (s: Strength): string => {
    switch (s) {
      case Strength.Weak:     return "bg-[#F5E4E6] text-[#7A1E2C] border border-[#e8c8cc]"
      case Strength.Moderate: return "bg-[#F6EFDF] text-[#8A5F1E] border border-[#e8d8b0]"
      case Strength.Strong:   return "bg-[#E7EFDE] text-[#3E6B2E] border border-[#c4d9b8]"
      default: return ""
    }
  }

  return (
    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-5 px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-lg font-semibold text-[#241014] truncate">{title}</h2>
      {hasStrength && strength && (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase shrink-0 ${getBadgeStyle(strength)}`}
        >
          {strength}
        </span>
      )}
    </CardHeader>
  )
}

function FinancialScore({ title, description, initialScore }: FinancialScoreProps) {
  const [score, setScore] = useState<Score>(initialScore ?? null)
  const hasScore = score !== null
  const max = 100
  const strength = Utils.getStrength(score, max)

  function handleAction() {
    if (!hasScore) {
      setScore(Utils.randomInt(0, max))
    }
  }

  return (
    <FinancialScoreCard>
      <FinancialScoreHeader title={title} strength={strength} />
      <div className="relative mb-6 animate-in fade-in duration-500">
        <FinancialScoreHalfCircle value={score} max={max} />
        <FinancialScoreDisplay value={score} max={max} />
      </div>
      <p className="text-[#9C9492] text-center mb-5 min-h-[3.5rem] text-xs leading-relaxed animate-in fade-in duration-500">
        {description}
      </p>
      <LiquidButton
        variant="default"
        size="xl"
        onClick={handleAction}
        className="w-full text-base font-semibold animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {hasScore ? "Ver detalles →" : "Calcular mi score"}
      </LiquidButton>
    </FinancialScoreCard>
  )
}

// Main export — use as a page section, not full-page
export function FinancialScoreCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-4">
      <CounterProvider>
        {data.map((card, i) => (
          <FinancialScore key={i} {...card} />
        ))}
      </CounterProvider>
    </div>
  )
}
