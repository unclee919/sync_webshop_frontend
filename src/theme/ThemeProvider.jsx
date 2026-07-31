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
  const root = document.documentElement.style

  // General Colors
  root.setProperty('--color-primary', theme.colors.primary || '#253D4E')
  root.setProperty('--color-secondary', theme.colors.secondary || '#84B082')
  root.setProperty('--color-accent', theme.colors.accent || '#FDC040')
  root.setProperty('--color-danger', theme.colors.danger || '#F74B81')
  root.setProperty('--color-background', theme.colors.background || '#ffffff')

  // Section Colors
  root.setProperty('--top-bar-bg', theme.colors.top_bar_bg || '#ffffff')
  root.setProperty('--top-bar-text', theme.colors.top_bar_text || '#253D4E')
  root.setProperty('--header-bg', theme.colors.header_bg || '#ffffff')
  root.setProperty('--header-text', theme.colors.header_text || '#253D4E')
  root.setProperty('--nav-bg', theme.colors.nav_bg || '#84B082')
  root.setProperty('--nav-text', theme.colors.nav_text || '#ffffff')
  root.setProperty('--footer-bg', theme.colors.footer_bg || '#253D4E')
  root.setProperty('--footer-text', theme.colors.footer_text || '#ffffff')

  // Spacing & Effects
  root.setProperty('--border-radius-md', theme.spacing?.border_radius || '15px')
  root.setProperty('--container-max-width', theme.spacing?.container_width || '1200px')

  // Fonts
  root.setProperty('--font-heading', FONT_STACKS[theme.fonts.heading] || FONT_STACKS.Cairo)
  root.setProperty('--font-body', FONT_STACKS[theme.fonts.body] || FONT_STACKS.Cairo)

  document.documentElement.dataset.layout = (theme.layout_style || 'Oasis').toLowerCase()
  
  const favicon = document.getElementById('favicon')
  if (favicon && theme.favicon) favicon.href = theme.favicon
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTheme()
      .then((data) => {
        applyThemeToDocument(data)
        setTheme(data)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', direction: 'rtl' }}>
        تعذر تحميل إعدادات المتجر ({error}). يرجى التحقق من VITE_API_BASE_URL والتأكد من إدراج هذا النطاق في إعدادات Webshop API على خادم ERPNext.
      </div>
    )
  }

  if (!theme) return null

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
