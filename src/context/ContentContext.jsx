import { createContext, useContext } from 'react'

const ContentContext = createContext({ content: {}, loading: false })

export function ContentProvider({ children }) {
  return <ContentContext.Provider value={{ content: { site_name: 'Sync Webshop' }, loading: false }}>{children}</ContentContext.Provider>
}

export function useContent() {
  return useContext(ContentContext)
}
