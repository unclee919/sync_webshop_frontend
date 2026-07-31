import { createContext, useContext, useEffect, useState } from 'react'
import { getTheme } from '../api/client'

const ThemeContext = createContext(null)

const FONT_STACKS = {
  Poppins: "'Poppins', sans-serif",
  'Playfair Display': "'Playfair Display', serif",
  Cairo: "'Cairo', sans-serif",
  Inter: "'Inter', sans-serif",
  Roboto: "'Roboto', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
}

function applyThemeToDocument(theme) {
  if (!theme) return
  const root = document.documentElement.style
  const colors = theme.colors || {}
  const fonts = theme.fonts || {}
  const spacing = theme.spacing || {}

  root.setProperty('--color-primary', String(colors.primary || '#253D4E'))
  root.setProperty('--color-secondary', String(colors.secondary || '#84B082'))
  root.setProperty('--color-accent', String(colors.accent || '#FDC040'))
  root.setProperty('--color-danger', String(colors.danger || '#F74B81'))
  root.setProperty('--color-background', String(colors.background || '#ffffff'))

  root.setProperty('--top-bar-bg', String(colors.top_bar_bg || '#ffffff'))
  root.setProperty('--top-bar-text', String(colors.top_bar_text || '#253D4E'))
  root.setProperty('--header-bg', String(colors.header_bg || '#ffffff'))
  root.setProperty('--header-text', String(colors.header_text || '#253D4E'))
  root.setProperty('--nav-bg', String(colors.nav_bg || '#84B082'))
  root.setProperty('--nav-text', String(colors.nav_text || '#ffffff'))
  root.setProperty('--footer-bg', String(colors.footer_bg || '#253D4E'))
  root.setProperty('--footer-text', String(colors.footer_text || '#ffffff'))

  root.setProperty('--border-radius-md', String(spacing.border_radius || '15px'))
  root.setProperty('--container-max-width', String(spacing.container_width || '1200px'))

  const dimensions = theme.dimensions || {}
  root.setProperty('--header-max-width', `${dimensions.header_max_width || 1200}px`)
  root.setProperty('--header-height', `${dimensions.header_height || 80}px`)
  root.setProperty('--header-padding-vertical', `${dimensions.header_padding_vertical || 15}px`)
  root.setProperty('--header-padding-horizontal', `${dimensions.header_padding_horizontal || 15}px`)
  root.setProperty('--logo-height', `${dimensions.logo_height || 45}px`)
  root.setProperty('--logo-width', dimensions.logo_width ? `${dimensions.logo_width}px` : 'auto')
  root.setProperty('--search-bar-max-width', `${dimensions.search_bar_max_width || 600}px`)
  root.setProperty('--search-bar-height', `${dimensions.search_bar_height || 45}px`)
  root.setProperty('--nav-bar-height', `${dimensions.nav_bar_height || 50}px`)
  root.setProperty('--hero-height', `${dimensions.hero_height || 450}px`)
  root.setProperty('--hero-width', `${dimensions.hero_width || 1200}px`)

  root.setProperty('--font-heading', String(FONT_STACKS[fonts.heading] || FONT_STACKS.Cairo))
  root.setProperty('--font-body', String(FONT_STACKS[fonts.body] || FONT_STACKS.Cairo))

  document.documentElement.dataset.layout = String(theme.layout_style || 'Oasis').toLowerCase()
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null)

  useEffect(() => {
    getTheme()
      .then((data) => {
        if (data) {
          applyThemeToDocument(data)
          setTheme(data)
        }
      })
      .catch((err) => console.error('Theme fetch error:', err))
  }, [])

  return <ThemeContext.Provider value={theme || { colors: {}, fonts: {} }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  return ctx
}
