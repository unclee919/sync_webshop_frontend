import { createContext, useContext, useMemo, useState } from 'react'

const ComparisonContext = createContext(null)
const STORAGE_KEY = 'sync_webshop_comparison'

function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function ComparisonProvider({ children }) {
  const [items, setItems] = useState(loadItems)
  const persist = (next) => { setItems(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }
  const add = (item) => { if (!item?.item_code || items.some((row) => row.item_code === item.item_code)) return; persist([...items, item].slice(-3)) }
  const remove = (itemCode) => persist(items.filter((item) => item.item_code !== itemCode))
  const clear = () => persist([])
  const isCompared = (itemCode) => items.some((item) => item.item_code === itemCode)
  const value = useMemo(() => ({ items, add, remove, clear, isCompared }), [items])
  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (!context) throw new Error('useComparison must be used inside ComparisonProvider')
  return context
}
