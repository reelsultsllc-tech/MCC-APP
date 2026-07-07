interface MccLogoProps {
  size?: number
  className?: string
}

export default function MccLogo({ size = 48, className = '' }: MccLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Burgundy circle background */}
      <circle cx="24" cy="24" r="24" fill="#7A1E2C" />

      {/* Coffee cup body */}
      <path
        d="M14 18h20l-2.5 14H16.5L14 18z"
        fill="white"
        opacity="0.95"
      />

      {/* Cup handle */}
      <path
        d="M34 22h2.5c1.4 0 2.5 1.1 2.5 2.5S37.9 27 36.5 27H34"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Saucer */}
      <ellipse cx="24" cy="33" rx="11" ry="2" fill="white" opacity="0.7" />

      {/* Steam lines */}
      <path
        d="M19 15 Q20 12 19 9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M24 14 Q25 11 24 8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M29 15 Q30 12 29 9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  )
}
