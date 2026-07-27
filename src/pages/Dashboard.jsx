import { useState } from 'react'
import { getMyOrders } from '../api/client'
import './Cart.css'
import './Dashboard.css'

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await getMyOrders({ email })
      setResult(data)
      setSearched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">My Orders</h1>

      <form className="dashboard-lookup" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="Enter the email you used at checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Looking up...' : 'Find my orders'}
        </button>
      </form>

      {error && <p className="checkout-error">{error}</p>}

      {searched && result && result.orders.length === 0 && (
        <p className="dashboard-empty">No orders found for that email.</p>
      )}

      {result &&
        result.orders.map((order) => (
          <div className="order-card" key={order.name}>
            <div className="order-card-top">
              <span className="order-card-name">{order.name}</span>
              <span className="order-status-pill">{order.status}</span>
            </div>
            <p className="order-card-date">{order.transaction_date}</p>
            <p className="order-card-items" dir="auto">
              {order.items.map((i) => `${i.item_name} × ${i.qty}`).join(', ')}
            </p>
            <p className="order-card-total">
              {order.grand_total} {order.currency}
            </p>
          </div>
        ))}
    </div>
  )
}
