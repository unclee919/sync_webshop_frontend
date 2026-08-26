import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { formatStorefrontPrice } from '../utils/currency'
import './MiniCart.css'


export default function MiniCart({ open, onClose }) {
  const { items, total, count, setQty, removeItem } = useCart()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const isArabic = lang === 'ar'
  const uiCopy = content?.copy?.ui || {}
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const text = {
    title: t(uiCopy.cart_title_en, uiCopy.cart_title_ar, 'Your cart'),
    empty: t(uiCopy.cart_empty_en, uiCopy.cart_empty_ar, 'Your cart is empty.'),
    shop: t(uiCopy.browse_products_en, uiCopy.browse_products_ar, 'Browse products'),
    checkout: t(uiCopy.checkout_en, uiCopy.checkout_ar, 'Checkout'),
    viewCart: t(uiCopy.view_cart_en, uiCopy.view_cart_ar, 'View cart'),
    free: t(uiCopy.free_shipping_unlocked_en, uiCopy.free_shipping_unlocked_ar, 'You unlocked free shipping.'),
    away: t(uiCopy.free_shipping_away_en, uiCopy.free_shipping_away_ar, 'away from free shipping'),
    item: t(uiCopy.cart_item_en, uiCopy.cart_item_ar, 'items'),
  }
  const threshold = Number(content?.shipping_settings?.free_shipping_threshold || 0)
  const hasThreshold = threshold > 0
  const progress = hasThreshold ? Math.min(100, (total / threshold) * 100) : 0
  const remaining = hasThreshold ? Math.max(0, threshold - total) : 0

  return (
    <>
      {open && <button type="button" className="mini-cart-backdrop" aria-label={t(uiCopy.close_cart_en, uiCopy.close_cart_ar, 'Close cart')} onClick={onClose} />}
      <aside className={`mini-cart ${open ? 'is-open' : ''} ${isRtl ? 'rtl' : 'ltr'}`} aria-hidden={!open}>
        <div className="mini-cart-header">
          <div><span className="mini-cart-kicker">{count} {text.item}</span><h2>{text.title}</h2></div>
          <button type="button" className="mini-cart-close" onClick={onClose} aria-label={t(uiCopy.close_cart_en, uiCopy.close_cart_ar, 'Close cart')}>×</button>
        </div>
        {hasThreshold && <div className="mini-cart-progress" aria-label={t(uiCopy.free_shipping_progress_en, uiCopy.free_shipping_progress_ar, 'Free shipping progress')}>
          <div className="mini-cart-progress-copy">{remaining > 0 ? <span>{formatStorefrontPrice(remaining, items[0]?.currency, content)} {text.away}</span> : <strong><span className="shipping-unlocked-mark" aria-hidden="true">✓</span>{text.free}</strong>}</div>
          <div className="mini-cart-progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>}
        <div className="mini-cart-items">
          {items.length === 0 ? <div className="mini-cart-empty"><span className="mini-cart-empty-icon">♡</span><p>{text.empty}</p><Link to="/products" onClick={onClose}>{text.shop}</Link></div> : items.map((item) => (
            <article className="mini-cart-item" key={item.item_code}>
              <div className="mini-cart-image">{item.image ? <img src={item.image} alt="" /> : <span>{item.item_name?.slice(0, 1)}</span>}</div>
              <div className="mini-cart-item-info"><Link to={`/products/${encodeURIComponent(item.item_code)}`} onClick={onClose}>{item.item_name}</Link><span>{formatStorefrontPrice(item.price * item.qty, item.currency, content)}</span><div className="mini-cart-qty"><button type="button" onClick={() => setQty(item.item_code, item.qty - 1)} aria-label={t(uiCopy.decrease_quantity_en, uiCopy.decrease_quantity_ar, 'Decrease quantity')}>−</button><b>{item.qty}</b><button type="button" onClick={() => setQty(item.item_code, item.qty + 1)} aria-label={t(uiCopy.increase_quantity_en, uiCopy.increase_quantity_ar, 'Increase quantity')}>+</button><button type="button" className="mini-cart-remove" onClick={() => removeItem(item.item_code)}>{t(uiCopy.remove_en, uiCopy.remove_ar, 'Remove')}</button></div></div>
            </article>
          ))}
        </div>
        {items.length > 0 && <div className="mini-cart-footer"><div className="mini-cart-total"><span>{t(uiCopy.subtotal_en, uiCopy.subtotal_ar, 'Subtotal')}</span><strong>{formatStorefrontPrice(total, items[0]?.currency, content)}</strong></div><Link className="mini-cart-primary" to="/checkout" onClick={onClose}>{text.checkout}</Link><Link className="mini-cart-secondary" to="/cart" onClick={onClose}>{text.viewCart}</Link></div>}
      </aside>
    </>
  )
}
