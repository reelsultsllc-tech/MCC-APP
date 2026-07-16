'use client'

interface IconProps {
  size?: number
  className?: string
}

/** Faithful SVG recreation of the My Credit Café red coffee-cup-with-circle logo */
export function MccLogoIcon({ size = 40, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main circle arc — opens at right where handle protrudes (3–5 o'clock gap) */}
      {/* Center (52,65) radius 44. 5 o'clock → (74,103). 3 o'clock → (96,65). */}
      <path d="M 74 103 A 44 44 0 1 1 96 65" stroke="#E31010" strokeWidth="6.5" strokeLinecap="round"/>

      {/* 3 steam lines */}
      <path d="M 36 38 Q 32 30 36 22 Q 40 14 36 6"  stroke="#E31010" strokeWidth="5"   strokeLinecap="round"/>
      <path d="M 52 36 Q 48 28 52 20 Q 56 12 52 4"  stroke="#E31010" strokeWidth="5"   strokeLinecap="round"/>
      <path d="M 68 38 Q 64 30 68 22 Q 72 14 68 6"  stroke="#E31010" strokeWidth="5"   strokeLinecap="round"/>

      {/* Cup body */}
      <path d="M 27 45 L 31 83 Q 31 88 36 88 L 68 88 Q 73 88 73 83 L 77 45 Z"
            stroke="#E31010" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Handle — extends into the gap */}
      <path d="M 73 59 Q 93 59 93 71 Q 93 83 73 83"
            stroke="#E31010" strokeWidth="5.5" strokeLinecap="round"/>

      {/* Saucer */}
      <path d="M 21 92 Q 52 107 83 92" stroke="#E31010" strokeWidth="5.5" strokeLinecap="round"/>
    </svg>
  )
}

interface MccLogoProps {
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean   // true = white text (for dark backgrounds like admin panel)
}

/** Full logo: icon + "My Credit / Café" text */
export function MccLogo({ size = 'md', dark = false }: MccLogoProps) {
  const iconSize  = size === 'sm' ? 28 : size === 'md' ? 40 : 60
  const textClass = size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : 'text-3xl'
  const mainColor = dark ? '#ffffff' : '#111111'
  return (
    <div className="flex items-center gap-3">
      <MccLogoIcon size={iconSize} />
      <div className="leading-[1.1]">
        <div className={`font-bold ${textClass}`} style={{ color: mainColor }}>My Credit</div>
        <div className={`font-bold ${textClass}`} style={{ color: '#E31010' }}>Café</div>
      </div>
    </div>
  )
}

/** Legacy default export for backwards compat */
export default MccLogoIcon
