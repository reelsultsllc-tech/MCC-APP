"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const liquidbuttonVariants = cva(
  "inline-flex items-center transition-all justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#7A1E2C]/50",
  {
    variants: {
      variant: {
        default:
          "bg-[#7A1E2C]/90 text-white hover:bg-[#7A1E2C] transition duration-300",
        destructive:
          "bg-red-500/80 text-white hover:bg-red-500/90",
        outline:
          "border border-[#E7E2E1] bg-white/50 text-[#241014] hover:bg-[#F7F5F4]",
        secondary:
          "bg-[#F5E4E6]/80 text-[#7A1E2C] hover:bg-[#F5E4E6]",
        ghost: "hover:bg-[#F5E4E6]/50 text-[#7A1E2C]",
        link: "text-[#7A1E2C] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 text-xs gap-1.5 px-4 has-[>svg]:px-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-6",
        xxl: "h-14 rounded-md px-10 has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xxl",
    },
  }
)

export function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn("relative", liquidbuttonVariants({ variant, size, className }))}
      {...props}
    >
      <div
        className="absolute top-0 left-0 z-0 h-full w-full rounded-md
          shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.2),inset_-3px_-3px_0.5px_-3px_rgba(255,255,255,0.1),inset_0_0_6px_6px_rgba(255,255,255,0.06),inset_0_0_2px_2px_rgba(255,255,255,0.04),0_0_12px_rgba(122,30,44,0.15)]
          transition-all"
      />
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md"
        style={{ backdropFilter: 'url("#btn-glass")' }}
      />
      <div className="pointer-events-none z-10">{children}</div>
      <GlassFilter />
    </Comp>
  )
}

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter id="btn-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="50" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}
