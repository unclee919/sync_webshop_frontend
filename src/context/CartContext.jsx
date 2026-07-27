import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // [{ item_code, item_name, price, currency, qty }]

  function addItem(item, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.item_code === item.item_code)
      if (existing) {
        return prev.map((i) =>
          i.item_code === item.item_code ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, { ...item, qty }]
    })
  }

  function removeItem(itemCode) {
    setItems((prev) => prev.filter((i) => i.item_code !== itemCode))
  }

  function setQty(itemCode, qty) {
    if (qty <= 0) return removeItem(itemCode)
    setItems((prev) => prev.map((i) => (i.item_code === itemCode ? { ...i, qty } : i)))
  }

  function clear() {
    setItems([])
  }

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0),
    [items]
  )

  const value = { items, addItem, removeItem, setQty, clear, total }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
