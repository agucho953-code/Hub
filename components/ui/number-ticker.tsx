'use client'

import { useInView, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type NumberTickerProps = {
  value: number
  decimalPlaces?: number
  durationMs?: number
  format?: (n: number) => string
  className?: string
  startOnView?: boolean
  delayMs?: number
}

const defaultFormat = (n: number, decimals: number) =>
  Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)

/**
 * Anima un número desde 0 al valor target con spring suave.
 * SSR-safe: pinta el valor final en el primer paint, anima en mount.
 * Honra `prefers-reduced-motion` (skip animación).
 */
export function NumberTicker({
  value,
  decimalPlaces = 0,
  durationMs = 800,
  format,
  className,
  startOnView = false,
  delayMs = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const stiffness = Math.max(40, Math.min(220, 16000 / durationMs))
  const damping = 25
  const springValue = useSpring(motionValue, { stiffness, damping })
  const inView = useInView(ref, { once: true, margin: '0px' })
  const formatter = format ?? ((n: number) => defaultFormat(n, decimalPlaces))

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      el.textContent = formatter(value)
      return
    }

    if (startOnView && !inView) {
      el.textContent = formatter(0)
      return
    }

    const start = () => motionValue.set(value)
    const t = window.setTimeout(start, delayMs)
    return () => window.clearTimeout(t)
  }, [value, motionValue, inView, startOnView, formatter, delayMs])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = formatter(latest)
    })
  }, [springValue, formatter])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {formatter(value)}
    </span>
  )
}
