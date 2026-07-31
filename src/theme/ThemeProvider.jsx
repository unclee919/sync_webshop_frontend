import { createContext, useContext } from 'react'

const ThemeContext = createContext({ colors: {}, fonts: {} })

export function ThemeProvider({ children }) {
  return <ThemeContext.Provider value={{ colors: {}, fonts: {} }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
