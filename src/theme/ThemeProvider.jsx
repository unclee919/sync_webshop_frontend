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
  root.setProperty('--color-primary', theme.colors.primary)
  root.setProperty('--color-secondary', theme.colors.secondary)
  root.setProperty('--color-accent', theme.colors.accent)
  root.setProperty('--color-background', theme.colors.background)
  
  // Section Colors
  root.setProperty('--top-bar-bg', theme.colors.top_bar_bg || '#f8f9fa')
  root.setProperty('--top-bar-text', theme.colors.top_bar_text || '#333333')
  root.setProperty('--header-bg', theme.colors.header_bg || '#ffffff')
  root.setProperty('--header-text', theme.colors.header_text || '#333333')
  root.setProperty('--nav-bg', theme.colors.nav_bg || '#ffffff')
  root.setProperty('--nav-text', theme.colors.nav_text || '#333333')
  root.setProperty('--footer-bg', theme.colors.footer_bg || '#333333')
  root.setProperty('--footer-text', theme.colors.footer_text || '#ffffff')
  
  // Fonts
  root.setProperty('--font-heading', FONT_STACKS[theme.fonts.heading] || FONT_STACKS.Inter)
  root.setProperty('--font-body', FONT_STACKS[theme.fonts.body] || FONT_STACKS.Inter)
  
  document.documentElement.dataset.layout = (theme.layout_style || 'Classic').toLowerCase()
  
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
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        Couldn't load store settings ({error}). Check VITE_API_BASE_URL and
        that this domain is listed in Webshop API Settings &gt; Allowed
        Frontend Origins on the ERPNext server.
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
