import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createOrder } from '../api/client'
import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Checkout() {
  const { items, clear, total } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const currency = items[0]?.currency || ''

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const order = await createOrder({
        customer: { name, email, phone },
        items: items.map((i) => ({ item_code: i.item_code, qty: i.qty })),
      })
      setResult(order)
      clear()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <h1>Order placed</h1>
          <p>
            Order <strong>{result.sales_order}</strong> - {result.grand_total} {result.currency}
          </p>
          <p>
            <Link to="/products">Continue shopping →</Link>
          </p>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="checkout-page">
        <h1 className="page-title">Checkout</h1>
        <p className="cart-empty">
          Your cart is empty. <Link to="/products">Browse products →</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && <p className="checkout-error">{error}</p>}

          <button type="submit" className="cart-cta" disabled={submitting}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <div className="checkout-order-summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <div className="checkout-order-row" key={item.item_code}>
              <span dir="auto">
                {item.item_name} × {item.qty}
              </span>
              <span>
                {item.price != null ? (item.price * item.qty).toFixed(2) : '—'}
              </span>
            </div>
          ))}
          <div className="checkout-order-total">
            <span>Total</span>
            <span>
              {total.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
