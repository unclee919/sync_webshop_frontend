import { createContext, useContext, useMemo, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('sync_webshop_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('sync_webshop_cart', JSON.stringify(items))
  }, [items])

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
    setToast({ message: `${item.item_name} added to cart`, type: "success" })
    setTimeout(() => setToast(null), 3000)
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

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  )

  const value = { items, addItem, removeItem, setQty, clear, total, count, toast }
  
  return <CartContext.Provider value={value}>{children}
      {toast && (
        <div className="cart-toast" style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#3BB77E',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(59, 183, 126, 0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'toast-in 0.3s ease-out'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style={{ fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
