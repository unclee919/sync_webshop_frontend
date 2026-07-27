import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getItem } from '../api/client'
import { useCart } from '../context/CartContext'
import RoastStamp from '../components/RoastStamp'
import './Products.css'

export default function ProductDetail() {
  const { itemCode } = useParams()
  const [item, setItem] = useState(null)
  const [error, setError] = useState(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    setItem(null)
    setAdded(false)
    getItem(itemCode).then(setItem).catch((err) => setError(err.message))
  }, [itemCode])

  if (error) {
    return (
      <div className="product-detail-page">
        <p className="products-error">Couldn't load this item: {error}</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="product-detail-page">
        <p className="products-empty">Loading...</p>
      </div>
    )
  }

  function handleAdd() {
    addItem(
      {
        item_code: item.item_code,
        item_name: item.item_name,
        price: item.price,
        currency: item.currency,
      },
      qty
    )
    setAdded(true)
  }

  return (
    <div className="product-detail-page">
      <Link to="/products" className="product-detail-back">
        ← Back to products
      </Link>

      <div className="product-detail">
        <div className="product-detail-media">
          {item.image ? (
            <img src={item.image} alt="" />
          ) : (
            <span className="product-card-image-empty">No image</span>
          )}
          <RoastStamp label="fresh" size={56} className="product-detail-stamp" />
        </div>

        <div>
          <span className="product-detail-group">{item.item_group}</span>
          <h1 className="product-detail-name" dir="auto">
            {item.item_name}
          </h1>

          {item.price != null ? (
            <p className="product-detail-price">
              {item.price} {item.currency}
              {item.stock_uom && (
                <span style={{ fontSize: '0.9rem', opacity: 0.6 }}> / {item.stock_uom}</span>
              )}
            </p>
          ) : (
            <p className="product-detail-price-empty">Price on request</p>
          )}

          {item.description && (
            <div
              className="product-detail-description"
              dir="auto"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          )}

          <div className="product-detail-actions">
            <div className="qty-stepper">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className={`add-to-cart-btn${added ? ' added' : ''}`}
              onClick={handleAdd}
            >
              {added ? 'Added ✓' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
