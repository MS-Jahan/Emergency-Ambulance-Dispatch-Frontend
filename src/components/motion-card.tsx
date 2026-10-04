import { cn } from '@/lib/utils'

interface MotionCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Stagger delay in ms */
  delay?: number
  /** Animation duration in ms */
  duration?: number
  as?: 'div' | 'section' | 'article' | 'li'
}

/**
 * Fades in and slides up on mount. Pure CSS, no JavaScript.
 * Wrap page sections/cards for a staggered entrance.
 */
export function MotionCard({
  delay = 0,
  duration = 400,
  as: Tag = 'div',
  className,
  style,
  children,
  ...props
}: MotionCardProps) {
  return (
    <Tag
      className={cn('motion-card', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  )
}
