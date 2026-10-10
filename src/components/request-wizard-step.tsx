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
 * Wrapper for one step of the request wizard: progress pills on top,
 * "Step n of m" + heading, content, sticky footer actions.
 */
export function RequestWizardStep({
  stepNumber,
  totalSteps,
  heading,
  children,
  footer,
}: RequestWizardStepProps) {
  return (
    <Card className="flex flex-col rounded-3xl border border-hairline p-6 sm:p-8">
      <div
        className="flex gap-2"
        role="progressbar"
        aria-label="Request progress"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={stepNumber}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full',
              i < stepNumber ? 'bg-brand' : 'bg-hairline',
            )}
          />
        ))}
      </div>

      <div className="mt-5 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate">
          Step {stepNumber} of {totalSteps}
        </p>
        <h1 className="text-3xl text-ink sm:text-4xl">{heading}</h1>
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
