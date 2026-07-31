import { createContext, useContext, useEffect, useState } from 'react'
import { getContent } from '../api/client'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContent()
      .then((data) => {
        setContent(data)
        setLoading(false)
        if (data?.theme?.colors) {
          const root = document.documentElement;
          const colors = data.theme.colors;
          if (colors.primary) root.style.setProperty('--color-primary', colors.primary);
          if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
          if (colors.accent) root.style.setProperty('--color-accent', colors.accent);
          if (colors.background) root.style.setProperty('--color-background', colors.background);
          if (colors.top_bar_bg) root.style.setProperty('--top-bar-bg', colors.top_bar_bg);
          if (colors.top_bar_text) root.style.setProperty('--top-bar-text', colors.top_bar_text);
          if (colors.header_bg) root.style.setProperty('--header-bg', colors.header_bg);
          if (colors.header_text) root.style.setProperty('--header-text', colors.header_text);
          if (colors.nav_bg) root.style.setProperty('--nav-bg', colors.nav_bg);
          if (colors.nav_text) root.style.setProperty('--nav-text', colors.nav_text);
          if (colors.footer_bg) root.style.setProperty('--footer-bg', colors.footer_bg);
          if (colors.footer_text) root.style.setProperty('--footer-text', colors.footer_text);
        }
      })
      .catch((err) => {
        console.error('Content fetch error:', err)
        setLoading(false)
      })
  }, [])

  const value = { content, loading }
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  return ctx
}
