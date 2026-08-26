import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getItem } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { formatStorefrontPrice } from '../utils/currency'
import './QuickView.css'

export default function QuickView({ itemCode, onClose }) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const isArabic = lang === 'ar'
  const uiCopy = content?.copy?.ui || {}
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))

  useEffect(() => {
    getItem(itemCode).then(setItem).finally(() => setLoading(false))
  }, [itemCode])

  if (!itemCode) return null

  return (
    <div className={`quick-view-overlay ${isRtl ? 'rtl' : 'ltr'}`} onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose} aria-label={t(uiCopy.close_en, uiCopy.close_ar, 'Close')}>×</button>
        {loading ? (
          <div className="quick-view-loading">
            <div className="shimmer shimmer-img" />
            <div className="shimmer-content">
              <div className="shimmer shimmer-title" />
              <div className="shimmer shimmer-price" />
              <div className="shimmer shimmer-text" />
            </div>
          </div>
        ) : item ? (
          <div className="quick-view-content">
            <div className="quick-view-gallery">
              {item.image ? <img src={item.image} alt={item.item_name} /> : <div className="no-image-large">{t(uiCopy.no_image_en, uiCopy.no_image_ar, 'No image')}</div>}
            </div>
            <div className="quick-view-info">
              <span className="product-cat">{item.item_group}</span>
              <h2>{item.item_name}</h2>
              <div className="detail-price">
                {item.price ? <span className="current-price">{formatStorefrontPrice(item.price, item.currency, content)}</span> : <span className="price-empty">{t(uiCopy.on_request_en, uiCopy.on_request_ar, 'Price on request')}</span>}
              </div>
              <div className="quick-view-description" dangerouslySetInnerHTML={{ __html: item.description?.slice(0, 250) + (item.description?.length > 250 ? '...' : '') }} />
              <div className="detail-actions">
                <div className="qty-input">
                  <button type="button" className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                  <button type="button" className="qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <button type="button" className="add-cart-large" onClick={() => { addItem(item, qty); onClose() }}>
                  {t(content?.add_to_cart_text_en, content?.add_to_cart_text_ar, 'Add to Cart')}
                </button>
              </div>
              <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="view-full-details">
                {t(uiCopy.view_details_en, uiCopy.view_details_ar, 'View full details')} →
              </Link>
            </div>
          </div>
        ) : (
          <div className="quick-view-error">{t('Could not load item details.', 'تعذر تحميل تفاصيل المنتج.')}</div>
        )}
      </div>
    </div>
  )
}
