'use client'

interface ScoreGaugeProps {
  score: number
  minScore?: number
  maxScore?: number
  label?: string
  delta?: string
}

export default function ScoreGauge({
  score,
  minScore = 300,
  maxScore = 850,
  label = 'Bueno',
  delta = '+77 puntos desde que empezamos',
}: ScoreGaugeProps) {
  // SVG semicircle gauge parameters
  const cx = 120
  const cy = 110
  const r = 88
  const strokeWidth = 14

  // The arc spans 180 degrees (left to right, top half)
  // Start: leftmost point (180°), End: rightmost point (0°)
  // We draw it as an arc from angle 180° to 360° (bottom half of unit circle = top of gauge)

  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  // Track: from 180° to 360° (0°) — left to right semicircle
  const startAngle = 180
  const endAngle = 360

  const trackStart = polarToCartesian(startAngle)
  const trackEnd = polarToCartesian(endAngle)

  const trackPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 0 1 ${trackEnd.x} ${trackEnd.y}`

  // Progress arc
  const pct = (score - minScore) / (maxScore - minScore)
  const progressAngle = startAngle + pct * 180
  const progressEnd = polarToCartesian(progressAngle)

  const largeArc = progressAngle - startAngle > 180 ? 1 : 0
  const progressPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArc} 1 ${progressEnd.x} ${progressEnd.y}`

  // Score zone colors (simplified)
  let zoneColor = '#7A1E2C' // default burgundy
  if (score < 580) zoneColor = '#C0392B'
  else if (score < 670) zoneColor = '#7A1E2C'
  else if (score < 740) zoneColor = '#6F8F5C'
  else zoneColor = '#4F9A5C'

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="130" viewBox="0 0 240 130" className="overflow-visible">
        {/* Track (gray background arc) */}
        <path
          d={trackPath}
          fill="none"
          stroke="#E7E2E1"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={progressPath}
          fill="none"
          stroke={zoneColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Score label in center */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="38"
          fontWeight="600"
          fill="#241014"
          fontFamily="system-ui"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize="13"
          fill="#57504E"
          fontFamily="system-ui"
        >
          {label}
        </text>

        {/* Min/max labels */}
        <text
          x={trackStart.x - 4}
          y={cy + 20}
          textAnchor="end"
          fontSize="10"
          fill="#9C9492"
          fontFamily="system-ui"
        >
          {minScore}
        </text>
        <text
          x={trackEnd.x + 4}
          y={cy + 20}
          textAnchor="start"
          fontSize="10"
          fill="#9C9492"
          fontFamily="system-ui"
        >
          {maxScore}
        </text>
      </svg>

      {/* Delta label */}
      <div className="flex items-center gap-1.5 mt-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2L7 12M7 2L3 6M7 2L11 6" stroke="#6F8F5C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs font-medium text-[#6F8F5C]">{delta}</span>
      </div>
    </div>
  )
}
