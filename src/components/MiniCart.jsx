import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './MiniCart.css'

const FREE_SHIPPING_THRESHOLD = 250

export default function MiniCart({ open, onClose }) {
  const { items, total, count, setQty, removeItem } = useCart()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const isArabic = lang === 'ar'
  const text = {
    title: isArabic ? 'سلة التسوق' : 'Your cart',
    empty: isArabic ? 'سلتك فارغة حالياً.' : 'Your cart is empty.',
    shop: isArabic ? 'تصفح المنتجات' : 'Browse products',
    checkout: isArabic ? 'إتمام الطلب' : 'Checkout',
    viewCart: isArabic ? 'عرض السلة' : 'View cart',
    free: isArabic ? 'تهانينا! حصلت على الشحن المجاني.' : 'You unlocked free shipping.',
    away: isArabic ? 'متبقي' : 'away from free shipping',
    item: isArabic ? 'منتج' : 'items',
  }
  const threshold = Number(content?.shipping_settings?.free_shipping_threshold || FREE_SHIPPING_THRESHOLD)
  const progress = Math.min(100, (total / Math.max(threshold, 1)) * 100)
  const remaining = Math.max(0, threshold - total)

  return (
    <>
      {open && <button type="button" className="mini-cart-backdrop" aria-label="Close cart" onClick={onClose} />}
      <aside className={`mini-cart ${open ? 'is-open' : ''} ${isRtl ? 'rtl' : 'ltr'}`} aria-hidden={!open}>
        <div className="mini-cart-header">
          <div><span className="mini-cart-kicker">{count} {text.item}</span><h2>{text.title}</h2></div>
          <button type="button" className="mini-cart-close" onClick={onClose} aria-label={isArabic ? 'إغلاق السلة' : 'Close cart'}>×</button>
        </div>
        <div className="mini-cart-progress" aria-label={isArabic ? 'تقدم الشحن المجاني' : 'Free shipping progress'}>
          <div className="mini-cart-progress-copy">{remaining > 0 ? <span>{remaining.toFixed(2)} SAR {text.away}</span> : <strong>{text.free}</strong>}</div>
          <div className="mini-cart-progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="mini-cart-items">
          {items.length === 0 ? <div className="mini-cart-empty"><span className="mini-cart-empty-icon">♡</span><p>{text.empty}</p><Link to="/products" onClick={onClose}>{text.shop}</Link></div> : items.map((item) => (
            <article className="mini-cart-item" key={item.item_code}>
              <div className="mini-cart-image">{item.image ? <img src={item.image} alt="" /> : <span>{item.item_name?.slice(0, 1)}</span>}</div>
              <div className="mini-cart-item-info"><Link to={`/products/${encodeURIComponent(item.item_code)}`} onClick={onClose}>{item.item_name}</Link><span>{(item.price * item.qty).toFixed(2)} {item.currency}</span><div className="mini-cart-qty"><button type="button" onClick={() => setQty(item.item_code, item.qty - 1)} aria-label="Decrease quantity">−</button><b>{item.qty}</b><button type="button" onClick={() => setQty(item.item_code, item.qty + 1)} aria-label="Increase quantity">+</button><button type="button" className="mini-cart-remove" onClick={() => removeItem(item.item_code)}>{isArabic ? 'حذف' : 'Remove'}</button></div></div>
            </article>
          ))}
        </div>
        {items.length > 0 && <div className="mini-cart-footer"><div className="mini-cart-total"><span>{isArabic ? 'الإجمالي' : 'Subtotal'}</span><strong>{total.toFixed(2)} {items[0]?.currency || 'SAR'}</strong></div><Link className="mini-cart-primary" to="/checkout" onClick={onClose}>{text.checkout}</Link><Link className="mini-cart-secondary" to="/cart" onClick={onClose}>{text.viewCart}</Link></div>}
      </aside>
    </>
  )
}

export { FREE_SHIPPING_THRESHOLD }
