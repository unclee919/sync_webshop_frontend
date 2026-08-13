import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getItem } from '../api/client'
import { trackEvent } from '../utils/analytics'
import { useContent } from './ContentContext'

const UltraExperienceContext = createContext(null)

const DEFAULT_ULTRA_SETTINGS = {
  adaptive_palette_enabled: 1,
  circadian_theme_enabled: 1,
  shared_transitions_enabled: 1,
  magnetic_cursor_enabled: 1,
  predictive_prefetch_enabled: 1,
  palette_transition_ms: 520,
  circadian_evening_start: 18,
  circadian_morning_start: 7,
}

const PALETTE_LIBRARY = {
  sage: { primary: '#42665b', secondary: '#76a995', accent: '#d9b86c', glow: '#c6e0d0', surface: '#eef5f0' },
  warm: { primary: '#714c3b', secondary: '#b8795d', accent: '#e6b85c', glow: '#f4d5bd', surface: '#fbf1ea' },
  ocean: { primary: '#1e5261', secondary: '#4a9ab0', accent: '#e7c67b', glow: '#c6e4ec', surface: '#eef8fa' },
  plum: { primary: '#5a3c59', secondary: '#a7789a', accent: '#e3bb80', glow: '#efd8ea', surface: '#faf1f7' },
  cedar: { primary: '#173f3a', secondary: '#2d8b72', accent: '#e6b85c', glow: '#cce2d4', surface: '#f8faf7' },
}

function getCircadianMode(settings) {
  const hour = new Date().getHours()
  const morning = Number(settings.circadian_morning_start ?? 7)
  const evening = Number(settings.circadian_evening_start ?? 18)
  if (hour >= evening || hour < morning) return 'golden-hour'
  if (hour < 11) return 'morning'
  if (hour < 16) return 'day'
  return 'late-day'
}

function hashPalette(item = {}) {
  const source = `${item.item_name || ''} ${item.item_group || ''}`.toLowerCase()
  if (/sage|green|ceramic|basket/.test(source)) return 'sage'
  if (/wood|leather|warm|lamp|journal/.test(source)) return 'warm'
  if (/blue|ocean|travel|glass/.test(source)) return 'ocean'
  if (/plum|purple|violet/.test(source)) return 'plum'
  return 'cedar'
}

function normalizePalette(item, fallback) {
  const supplied = item?.palette || item?.palette_data || {}
  const paletteKey = item?.palette_key || item?.accent_palette || hashPalette(item)
  const base = PALETTE_LIBRARY[paletteKey] || PALETTE_LIBRARY.cedar
  return {
    ...base,
    ...supplied,
    ...(item?.palette_color ? { accent: item.palette_color } : {}),
    key: paletteKey,
    fallback,
  }
}

function applyExperienceToDocument({ palette, circadianMode, settings }) {
  const root = document.documentElement
  const style = root.style
  const active = palette || PALETTE_LIBRARY.cedar
  style.setProperty('--context-primary', active.primary)
  style.setProperty('--context-secondary', active.secondary)
  style.setProperty('--context-accent', active.accent)
  style.setProperty('--context-glow', active.glow)
  style.setProperty('--context-surface', active.surface)
  style.setProperty('--palette-transition-ms', `${Number(settings.palette_transition_ms || 520)}ms`)
  root.dataset.circadian = settings.circadian_theme_enabled === 0 ? 'static' : circadianMode
  root.dataset.palette = active.key || 'cedar'
}

export function UltraExperienceProvider({ children }) {
  const { content } = useContent()
  const [palette, setPalette] = useState(PALETTE_LIBRARY.cedar)
  const [transition, setTransition] = useState(null)
  const [prefetchCache, setPrefetchCache] = useState(() => new Map())
  const rawSettings = content?.ultra_settings || {}
  const settings = useMemo(() => ({ ...DEFAULT_ULTRA_SETTINGS, ...rawSettings }), [rawSettings])
  const circadianMode = getCircadianMode(settings)

  useEffect(() => {
    applyExperienceToDocument({ palette, circadianMode, settings })
    trackEvent('circadian_theme_active', { theme_mode: circadianMode, palette_key: palette?.key || 'cedar' })
  }, [palette, circadianMode, settings])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (settings.circadian_theme_enabled !== 0) {
        applyExperienceToDocument({ palette, circadianMode: getCircadianMode(settings), settings })
      }
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [palette, settings])

  const activateProductPalette = useCallback((item) => {
    if (settings.adaptive_palette_enabled === 0) return
    const nextPalette = normalizePalette(item, PALETTE_LIBRARY.cedar)
    setPalette(nextPalette)
    trackEvent('adaptive_palette_applied', { palette_key: nextPalette.key, item_group: item?.item_group || 'unknown' })
  }, [settings.adaptive_palette_enabled])

  const resetProductPalette = useCallback(() => setPalette(PALETTE_LIBRARY.cedar), [])

  const beginSharedTransition = useCallback((item, sourceRect = null) => {
    if (settings.shared_transitions_enabled === 0) return
    setTransition({ item, sourceRect, id: `${item?.item_code || 'item'}-${Date.now()}` })
    trackEvent('shared_product_transition_start', { item_group: item?.item_group || 'unknown' })
    window.setTimeout(() => setTransition(null), 620)
  }, [settings.shared_transitions_enabled])

  const prefetchProduct = useCallback(async (itemCode) => {
    if (!itemCode || settings.predictive_prefetch_enabled === 0 || prefetchCache.has(itemCode)) return
    try {
      const item = await getItem(itemCode)
      setPrefetchCache((current) => new Map(current).set(itemCode, item))
    } catch { /* Prefetch is an enhancement and never blocks navigation. */ }
  }, [prefetchCache, settings.predictive_prefetch_enabled])

  const value = useMemo(() => ({
    settings,
    palette,
    circadianMode,
    transition,
    prefetchCache,
    activateProductPalette,
    resetProductPalette,
    beginSharedTransition,
    prefetchProduct,
  }), [settings, palette, circadianMode, transition, prefetchCache, activateProductPalette, resetProductPalette, beginSharedTransition, prefetchProduct])

  return <UltraExperienceContext.Provider value={value}>{children}</UltraExperienceContext.Provider>
}

export function useUltraExperience() {
  const context = useContext(UltraExperienceContext)
  if (!context) throw new Error('useUltraExperience must be used inside UltraExperienceProvider')
  return context
}

export { PALETTE_LIBRARY }
