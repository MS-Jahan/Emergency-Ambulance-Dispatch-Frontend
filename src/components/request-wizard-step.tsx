'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RequestWizardStepProps {
  stepNumber: number
  totalSteps: number
  heading: string
  children: React.ReactNode
  /** Bottom action bar (Back / Next buttons). Sticky on mobile. */
  footer?: React.ReactNode
}

/**
 * Wrapper for one step of the request wizard: colored progress segments
 * on top, "Step n of m" + heading, content, sticky footer actions.
 */
export function RequestWizardStep({
  stepNumber,
  totalSteps,
  heading,
  children,
  footer,
}: RequestWizardStepProps) {
  return (
    <Card className="border border-hairline p-6 sm:p-8 flex flex-col">
      {/* Progress segments */}
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < stepNumber ? 'bg-oxygen' : 'bg-hairline',
            )}
          />
        ))}
      </div>

      <div className="mt-5 space-y-1">
        <p className="text-xs font-medium text-slate">
          Step {stepNumber} of {totalSteps}
        </p>
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{heading}</h1>
      </div>

      <div className="mt-6 flex-1">{children}</div>

      {footer && (
        <div
          className={cn(
            'mt-8 -mx-6 border-t border-hairline bg-paper px-6 pt-4 pb-6 sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:p-0',
            'sticky bottom-0',
          )}
        >
          {footer}
        </div>
      )}
    </Card>
  )
}
