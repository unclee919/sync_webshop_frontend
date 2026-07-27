import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Cart() {
  const { items, setQty, removeItem, total } = useCart()

  if (!items.length) {
    return (
      <div className="cart-page">
        <h1 className="page-title">Cart</h1>
        <p className="cart-empty">
          Your cart is empty. <Link to="/products">Browse products →</Link>
        </p>
      </div>
    )
  }

  const currency = items[0]?.currency || ''

  return (
    <div className="cart-page">
      <h1 className="page-title">Cart</h1>

      <div className="cart-list">
        {items.map((item) => (
          <div className="cart-row" key={item.item_code}>
            <div>
              <p className="cart-row-name" dir="auto">
                {item.item_name}
              </p>
              {item.price != null && (
                <p className="cart-row-price">
                  {item.price} {item.currency} each
                </p>
              )}
            </div>

            <div className="cart-row-qty">
              <button
                type="button"
                onClick={() => setQty(item.item_code, item.qty - 1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => setQty(item.item_code, Number(e.target.value) || 1)}
              />
              <button
                type="button"
                onClick={() => setQty(item.item_code, item.qty + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="cart-row-remove"
              onClick={() => removeItem(item.item_code)}
            >
              Remove
            </button>

            <span className="cart-row-line-total">
              {item.price != null ? `${(item.price * item.qty).toFixed(2)} ${item.currency}` : '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <span>Total</span>
        <span>
          {total.toFixed(2)} {currency}
        </span>
      </div>

      <Link to="/checkout" className="cart-cta">
        Go to checkout →
      </Link>
    </div>
  )
}
