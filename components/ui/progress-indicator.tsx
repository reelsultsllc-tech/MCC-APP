'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  steps?: number
  initialStep?: number
  onComplete?: () => void
  onBack?: () => void
  continueLabel?: string
  finishLabel?: string
  backLabel?: string
  stepLabels?: string[]
  className?: string
}

const ProgressIndicator = ({
  steps = 3,
  initialStep = 1,
  onComplete,
  onBack,
  continueLabel = 'Continuar',
  finishLabel = 'Terminar',
  backLabel = 'Atrás',
  stepLabels,
  className,
}: ProgressIndicatorProps) => {
  const [step, setStep] = useState(initialStep)
  const [isExpanded, setIsExpanded] = useState(initialStep === 1)

  const handleContinue = () => {
    if (step < steps) {
      setStep(step + 1)
      setIsExpanded(false)
    } else {
      onComplete?.()
    }
  }

  const handleBack = () => {
    if (step === 2) setIsExpanded(true)
    if (step > 1) {
      setStep(step - 1)
      onBack?.()
    }
  }

  // Progress bar width per step (3 dots at ~24px gap each)
  const progressWidths: Record<number, string> = {
    1: '24px',
    2: '60px',
    3: '96px',
  }
  const progressWidth = progressWidths[Math.min(step, steps)] ?? `${24 + (step - 1) * 36}px`

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      {/* Step label */}
      {stepLabels && stepLabels[step - 1] && (
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium text-[#9C9492] uppercase tracking-widest"
        >
          {stepLabels[step - 1]}
        </motion.p>
      )}

      {/* Dots + progress bar */}
      <div className="flex items-center gap-6 relative">
        {Array.from({ length: steps }, (_, i) => i + 1).map((dot) => (
          <div
            key={dot}
            className={cn(
              'w-2 h-2 rounded-full relative z-10 transition-colors duration-300',
              dot <= step ? 'bg-[#241014]' : 'bg-[#C4BEBC]'
            )}
          />
        ))}
        {/* MCC green progress overlay */}
        <motion.div
          initial={{ width: '24px', x: 0 }}
          animate={{ width: progressWidth, x: 0 }}
          className="absolute -left-[8px] -top-[8px] -translate-y-1/2 h-3 bg-[#4F9A5C] rounded-full"
          transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.8, bounce: 0.25, duration: 0.6 }}
        />
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs">
        <motion.div
          className="flex items-center gap-1.5"
          animate={{ justifyContent: isExpanded ? 'stretch' : 'space-between' }}
        >
          {!isExpanded && (
            <motion.button
              initial={{ opacity: 0, width: 0, scale: 0.8 }}
              animate={{ opacity: 1, width: '64px', scale: 1 }}
              transition={{
                type: 'spring', stiffness: 400, damping: 15, mass: 0.8, bounce: 0.25, duration: 0.6,
                opacity: { duration: 0.2 },
              }}
              onClick={handleBack}
              className="px-4 py-2.5 text-[#57504E] flex items-center justify-center bg-[#F7F5F4] border border-[#E7E2E1] font-semibold rounded-full hover:bg-[#EDE7E6] transition-colors flex-1 w-16 text-sm"
            >
              {backLabel}
            </motion.button>
          )}
          <motion.button
            onClick={handleContinue}
            animate={{ flex: isExpanded ? 1 : 'inherit' }}
            className={cn(
              'px-4 py-2.5 rounded-full text-white bg-[#7A1E2C] hover:bg-[#5C1520] active:bg-[#5C1520] transition-colors flex-1 w-56 font-semibold text-sm',
              !isExpanded && 'w-44'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {step === steps && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15, mass: 0.5, bounce: 0.4 }}
                >
                  <CircleCheck size={15} />
                </motion.div>
              )}
              {step === steps ? finishLabel : continueLabel}
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default ProgressIndicator
