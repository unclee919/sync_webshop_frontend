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
