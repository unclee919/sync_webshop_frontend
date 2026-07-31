import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { getCheckoutSettings } from '../api/client'
import './Cart.css'

export default function Cart() {
  const { items, setQty, removeItem, total } = useCart()
  const { lang, isRtl } = useLanguage()
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
        <h1 className="page-title">{lang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h1>
        <div className="cart-empty-state">
          <p>{lang === 'ar' ? 'سلة التسوق الخاصة بك فارغة.' : 'Your cart is empty.'}</p>
          <Link to="/products" className="btn-primary">
            {lang === 'ar' ? 'تصفح المنتجات ←' : 'Browse products →'}
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
      <h1 className="page-title">{lang === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h1>
      
      {threshold > 0 && (
        <div className="shipping-progress-container">
          <div className="shipping-progress-text">
            {total >= threshold ? (
              <span>{lang === 'ar' ? 'مبروك! لقد حصلت على شحن مجاني' : 'Congratulations! You have free shipping'}</span>
            ) : (
              <span>
                {lang === 'ar' 
                  ? `بقي ${remaining.toFixed(2)} ${currency} للحصول على شحن مجاني` 
                  : `You're ${remaining.toFixed(2)} ${currency} away from free shipping`}
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
            <span className="col-product">{lang === 'ar' ? 'المنتج' : 'Product'}</span>
            <span className="col-price">{lang === 'ar' ? 'السعر' : 'Price'}</span>
            <span className="col-qty">{lang === 'ar' ? 'الكمية' : 'Quantity'}</span>
            <span className="col-total">{lang === 'ar' ? 'المجموع' : 'Total'}</span>
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
                      {lang === 'ar' ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                </div>
                
                <div className="col-price">
                  {item.price} {item.currency}
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
                  {(item.price * item.qty).toFixed(2)} {item.currency}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="summary-card">
            <h2 className="summary-title">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
            <div className="summary-row">
              <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{total.toFixed(2)} {currency}</span>
            </div>
            <div className="summary-row">
              <span>{lang === 'ar' ? 'الشحن' : 'Shipping'}</span>
              <span>
                {shippingRule ? (
                  total >= threshold ? (lang === 'ar' ? 'مجاني' : 'Free') : `${shippingRule.shipping_cost.toFixed(2)} ${currency}`
                ) : (
                  lang === 'ar' ? 'محسوب عند الدفع' : 'Calculated at checkout'
                )}
              </span>
            </div>
            <div className="summary-total">
              <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span>
                {(total + (shippingRule && total < threshold ? shippingRule.shipping_cost : 0)).toFixed(2)} {currency}
              </span>
            </div>
            <Link to="/checkout" className="checkout-btn">
              {lang === 'ar' ? 'إتمام الشراء' : 'Proceed to Checkout'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
