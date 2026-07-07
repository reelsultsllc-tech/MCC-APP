'use client'

import { ScorePoint } from '@/lib/data'

interface ScoreChartProps {
  data: ScorePoint[]
}

export default function ScoreChart({ data }: ScoreChartProps) {
  const width = 320
  const height = 120
  const paddingX = 28
  const paddingTop = 12
  const paddingBottom = 24

  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingTop - paddingBottom

  const scores = data.map((d) => d.score)
  const minVal = Math.min(...scores) - 20
  const maxVal = Math.max(...scores) + 10

  function xPos(i: number) {
    return paddingX + (i / (data.length - 1)) * innerWidth
  }

  function yPos(score: number) {
    return paddingTop + innerHeight - ((score - minVal) / (maxVal - minVal)) * innerHeight
  }

  // Build polyline points
  const points = data.map((d, i) => `${xPos(i)},${yPos(d.score)}`).join(' ')

  // Build area path (close back along the bottom)
  const areaPath =
    `M ${xPos(0)},${yPos(data[0].score)} ` +
    data.slice(1).map((d, i) => `L ${xPos(i + 1)},${yPos(d.score)}`).join(' ') +
    ` L ${xPos(data.length - 1)},${paddingTop + innerHeight} L ${xPos(0)},${paddingTop + innerHeight} Z`

  const gradientId = 'scoreGradient'

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A1E2C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7A1E2C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gradient fill below line */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Grid lines (subtle) */}
        {[0, 0.5, 1].map((t, i) => {
          const y = paddingTop + t * innerHeight
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#E7E2E1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )
        })}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#7A1E2C"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xPos(i)} cy={yPos(d.score)} r="4" fill="#7A1E2C" />
            <circle cx={xPos(i)} cy={yPos(d.score)} r="2" fill="white" />
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={xPos(i)}
            y={height - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#9C9492"
            fontFamily="system-ui"
          >
            {d.m}
          </text>
        ))}

        {/* Score labels above last point */}
        <text
          x={xPos(data.length - 1)}
          y={yPos(data[data.length - 1].score) - 8}
          textAnchor="middle"
          fontSize="10"
          fill="#7A1E2C"
          fontWeight="600"
          fontFamily="system-ui"
        >
          {data[data.length - 1].score}
        </text>
      </svg>
    </div>
  )
}
