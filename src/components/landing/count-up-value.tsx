'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type CountUpValueProps = {
  value: string
  className?: string
  durationMs?: number
  delayMs?: number
}

type ParsedValue = {
  prefix: string
  suffix: string
  target: number
  decimals: number
  decimalSeparator: ',' | '.'
}

function parseValue(value: string): ParsedValue | null {
  const match = value.trim().match(/^(.*?)(-?\d+(?:[.,]\d+)?)(.*)$/)
  if (!match) return null

  const [, prefix, numericPart, suffix] = match
  const decimalSeparator: ',' | '.' = numericPart.includes(',') ? ',' : '.'
  const normalized = numericPart.replace(',', '.')
  const target = Number(normalized)
  if (!Number.isFinite(target)) return null

  const decimalMatch = numericPart.match(/[.,](\d+)/)
  const decimals = decimalMatch ? decimalMatch[1].length : 0

  return { prefix, suffix, target, decimals, decimalSeparator }
}

function formatAnimatedValue(parsed: ParsedValue, current: number): string {
  const rounded = parsed.decimals > 0 ? current.toFixed(parsed.decimals) : String(Math.round(current))
  const localized = parsed.decimalSeparator === ',' ? rounded.replace('.', ',') : rounded
  return `${parsed.prefix}${localized}${parsed.suffix}`
}

export default function CountUpValue({
  value,
  className,
  durationMs = 1400,
  delayMs = 0,
}: CountUpValueProps) {
  const parsed = useMemo(() => parseValue(value), [value])
  const nodeRef = useRef<HTMLSpanElement | null>(null)
  const [inView, setInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.some(entry => entry.isIntersecting)
        if (visible) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!parsed || !inView || hasAnimated) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplayValue(value)
      setHasAnimated(true)
      return
    }

    let rafId = 0
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp

      const elapsed = timestamp - startTime - delayMs
      if (elapsed < 0) {
        rafId = window.requestAnimationFrame(step)
        return
      }

      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = parsed.target * eased

      setDisplayValue(formatAnimatedValue(parsed, current))

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
        setHasAnimated(true)
      }
    }

    setDisplayValue(formatAnimatedValue(parsed, 0))
    rafId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [delayMs, durationMs, hasAnimated, inView, parsed, value])

  return (
    <span ref={nodeRef} className={className}>
      {displayValue}
    </span>
  )
}
