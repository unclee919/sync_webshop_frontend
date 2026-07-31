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

  root.setProperty('--color-primary', colors.primary || '#253D4E')
  root.setProperty('--color-secondary', colors.secondary || '#84B082')
  root.setProperty('--color-accent', colors.accent || '#FDC040')
  root.setProperty('--color-danger', colors.danger || '#F74B81')
  root.setProperty('--color-background', colors.background || '#ffffff')

  root.setProperty('--top-bar-bg', colors.top_bar_bg || '#ffffff')
  root.setProperty('--top-bar-text', colors.top_bar_text || '#253D4E')
  root.setProperty('--header-bg', colors.header_bg || '#ffffff')
  root.setProperty('--header-text', colors.header_text || '#253D4E')
  root.setProperty('--nav-bg', colors.nav_bg || '#84B082')
  root.setProperty('--nav-text', colors.nav_text || '#ffffff')
  root.setProperty('--footer-bg', colors.footer_bg || '#253D4E')
  root.setProperty('--footer-text', colors.footer_text || '#ffffff')

  root.setProperty('--border-radius-md', spacing.border_radius || '15px')
  root.setProperty('--container-max-width', spacing.container_width || '1200px')

  root.setProperty('--font-heading', FONT_STACKS[fonts.heading] || FONT_STACKS.Cairo)
  root.setProperty('--font-body', FONT_STACKS[fonts.body] || FONT_STACKS.Cairo)

  document.documentElement.dataset.layout = (theme.layout_style || 'Oasis').toLowerCase()
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

  // Don't block rendering if theme is not loaded yet
  return <ThemeContext.Provider value={theme || { colors: {}, fonts: {} }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  return ctx
}
