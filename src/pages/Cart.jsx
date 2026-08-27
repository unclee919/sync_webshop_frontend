import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { formatStorefrontPrice } from '../utils/currency'
import { getCheckoutSettings } from '../api/client'
import './Cart.css'

export default function Cart() {
  const { items, setQty, removeItem, total } = useCart()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const uiCopy = content?.copy?.ui || {}
  const t = (key, en, ar) => lang === 'ar' ? (uiCopy[`${key}_ar`] || ar || en) : (uiCopy[`${key}_en`] || en || ar)
  const text = {
    title: t('cart_title', 'Shopping Cart', 'سلة التسوق'),
    empty: t('cart_empty', 'Your cart is empty.', 'سلتك فارغة حالياً.'),
    browse: t('browse_products', 'Browse products', 'تصفح المنتجات'),
    unlocked: t('free_shipping_unlocked', 'You unlocked free shipping.', 'تهانينا! حصلت على الشحن المجاني.'),
    away: t('free_shipping_away', 'away from free shipping', 'متبقي'),
    product: t('search_result_product', 'Product', 'المنتج'),
    // Price has no existing UI-label field yet; keep the current fallback until a reviewed field is added.
    price: lang === 'ar' ? 'السعر' : 'Price',
    quantity: t('quantity', 'Quantity', 'الكمية'),
    total: t('total', 'Total', 'الإجمالي'),
    remove: t('remove', 'Remove', 'حذف'),
    summary: t('order_summary', 'Order Summary', 'ملخص الطلب'),
    subtotal: t('subtotal', 'Subtotal', 'المجموع الفرعي'),
    shipping: t('shipping', 'Shipping', 'الشحن'),
    free: t('free', 'Free', 'مجاني'),
    calculated: lang === 'ar' ? 'يُحسب عند الدفع' : 'Calculated at checkout',
    checkout: t('checkout', 'Checkout', 'إتمام الطلب'),
  }
  const [shippingRule, setShippingRule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCheckoutSettings().then(settings => {
      if (settings.shipping_rules && settings.shipping_rules.length > 0) {
        setShippingRule(settings.shipping_rules[0])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (!items.length) {
    return (
      <div className={`cart-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <h1 className="page-title">{text.title}</h1>
        <div className="cart-empty-state">
          <p>{text.empty}</p>
          <Link to="/products" className="btn-primary">
            {text.browse} →
          </Link>
        </div>
      </div>
    )
  }

  const currency = items[0]?.currency || ''
  const threshold = shippingRule?.free_shipping_threshold || 0
  const progress = threshold > 0 ? Math.min((total / threshold) * 100, 100) : 0
  const remaining = threshold - total

  return (
    <div className={`cart-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{text.title}</h1>
      
      {threshold > 0 && (
        <div className="shipping-progress-container">
          <div className="shipping-progress-text">
            {total >= threshold ? (
              <span>{text.unlocked}</span>
            ) : (
              <span>
                {lang === 'ar'
                  ? `${formatStorefrontPrice(remaining, currency, content)} ${text.away} للحصول على شحن مجاني`
                  : `${formatStorefrontPrice(remaining, currency, content)} ${text.away}`}
              </span>
            )}
          </div>
          <div className="shipping-progress-bar-bg">
            <div className="shipping-progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      <div className="cart-container">
        <div className="cart-main">
          <div className="cart-header">
            <span className="col-product">{text.product}</span>
            <span className="col-price">{text.price}</span>
            <span className="col-qty">{text.quantity}</span>
            <span className="col-total">{text.total}</span>
          </div>

          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.item_code}>
                <div className="col-product item-info">
                  <div className="item-image">
                    {item.image && <img src={item.image} alt={item.item_name} />}
                  </div>
                  <div className="item-details">
                    <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="item-name">
                      {item.item_name}
                    </Link>
                    <button className="remove-btn" onClick={() => removeItem(item.item_code)}>
                      {text.remove}
                    </button>
                  </div>
                </div>
                
                <div className="col-price">
                  {formatStorefrontPrice(item.price, item.currency, content)}
                </div>

                <div className="col-qty">
                  <div className="qty-stepper small">
                    <button onClick={() => setQty(item.item_code, item.qty - 1)}>−</button>
                    <input 
                      type="number" 
                      value={item.qty} 
                      onChange={e => setQty(item.item_code, parseInt(e.target.value) || 1)} 
                    />
                    <button onClick={() => setQty(item.item_code, item.qty + 1)}>+</button>
                  </div>
                </div>

                <div className="col-total">
                  {formatStorefrontPrice(item.price * item.qty, item.currency, content)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="summary-card">
            <h2 className="summary-title">{text.summary}</h2>
            <div className="summary-row">
              <span>{text.subtotal}</span>
              <span>{formatStorefrontPrice(total, currency, content)}</span>
            </div>
            <div className="summary-row">
              <span>{text.shipping}</span>
              <span>
                {shippingRule ? (
                  total >= threshold ? text.free : formatStorefrontPrice(shippingRule.shipping_cost, currency, content)
                ) : (
                  text.calculated
                )}
              </span>
            </div>
            <div className="summary-total">
              <span>{text.total}</span>
              <span>
                {formatStorefrontPrice(total + (shippingRule && total < threshold ? shippingRule.shipping_cost : 0), currency, content)}
              </span>
            </div>
            <Link to="/checkout" className="checkout-btn">
              {text.checkout}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
