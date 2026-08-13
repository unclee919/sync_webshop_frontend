import { useEffect, useRef } from 'react'
import { useUltraExperience } from '../context/UltraExperienceContext'
import './MagneticCursor.css'

export default function MagneticCursor() {
  const cursorRef = useRef(null)
  const { settings } = useUltraExperience()

  useEffect(() => {
    if (settings.magnetic_cursor_enabled === 0 || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const cursor = cursorRef.current
    let raf = 0
    let pointer = { x: -100, y: -100 }
    let activeTarget = null

    const render = () => {
      if (!cursor) return
      cursor.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0)`
      raf = 0
    }
    const onMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY }
      if (!raf) raf = requestAnimationFrame(render)
      const target = event.target.closest?.('[data-magnetic]')
      if (target !== activeTarget) {
        activeTarget?.classList.remove('magnetic-active')
        activeTarget = target
        activeTarget?.classList.add('magnetic-active')
      }
      if (target) {
        const rect = target.getBoundingClientRect()
        const strength = Number(target.dataset.magneticStrength || 0.18)
        target.style.setProperty('--magnetic-x', `${(event.clientX - (rect.left + rect.width / 2)) * strength}px`)
        target.style.setProperty('--magnetic-y', `${(event.clientY - (rect.top + rect.height / 2)) * strength}px`)
      }
    }
    const clearTarget = () => {
      activeTarget?.classList.remove('magnetic-active')
      activeTarget = null
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', clearTarget)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', clearTarget)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [settings.magnetic_cursor_enabled])

  if (settings.magnetic_cursor_enabled === 0) return null
  return <span ref={cursorRef} className="magnetic-cursor" aria-hidden="true" />
}
