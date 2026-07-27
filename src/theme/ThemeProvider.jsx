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
  root.setProperty('--color-primary', theme.colors.primary)
  root.setProperty('--color-secondary', theme.colors.secondary)
  root.setProperty('--color-accent', theme.colors.accent)
  root.setProperty('--color-background', theme.colors.background)
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
    // A broken theme fetch should not render an unstyled, broken-looking
    // site - show a plain, honest message instead of guessing at defaults.
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        Couldn't load store settings ({error}). Check VITE_API_BASE_URL and
        that this domain is listed in Webshop API Settings &gt; Allowed
        Frontend Origins on the ERPNext server.
      </div>
    )
  }

  if (!theme) return null // could add a themed loading skeleton later

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
