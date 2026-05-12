import React, { ReactNode } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

interface Props {
  children: ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4
}

export default function AnimatedSection({ children, className = '', delay = 0 }: Props) {
  const ref = useScrollReveal()
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : ''
  return (
    <div ref={ref} className={`reveal ${delayClass} ${className}`}>
      {children}
    </div>
  )
}
