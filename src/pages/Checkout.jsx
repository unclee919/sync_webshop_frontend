import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createOrder } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import './Cart.css'

export default function Checkout() {
  const { items, clear, total } = useCart()
  const { lang, isRtl } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
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
        customer: { name, email, phone, address },
        items: items.map((i) => ({ item_code: i.item_code, qty: i.qty })),
        submit: true
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
      <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <div className="checkout-success-card">
          <div className="success-icon">✓</div>
          <h1>{lang === 'ar' ? 'تم تقديم الطلب بنجاح' : 'Order Placed Successfully'}</h1>
          <p>
            {lang === 'ar' ? 'رقم الطلب:' : 'Order Number:'} <strong>{result.sales_order}</strong>
          </p>
          <p>
            {lang === 'ar' ? 'الإجمالي:' : 'Total:'} <strong>{result.grand_total} {result.currency}</strong>
          </p>
          <div className="success-actions">
            <Link to="/products" className="btn-primary">
              {lang === 'ar' ? 'مواصلة التسوق' : 'Continue Shopping'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <h1 className="page-title">{lang === 'ar' ? 'الدفع' : 'Checkout'}</h1>
        <p className="cart-empty">{lang === 'ar' ? 'سلة التسوق فارغة.' : 'Your cart is empty.'}</p>
        <Link to="/products" className="btn-primary">{lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}</Link>
      </div>
    )
  }

  return (
    <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{lang === 'ar' ? 'الدفع' : 'Checkout'}</h1>
      
      <div className="checkout-grid">
        <div className="checkout-form-container">
          <h2 className="section-title-small">{lang === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}</h2>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                <input required value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>{lang === 'ar' ? 'العنوان بالتفصيل' : 'Detailed Address'}</label>
              <textarea required value={address} onChange={e => setAddress(e.target.value)} rows="3"></textarea>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="place-order-btn" disabled={submitting}>
              {submitting ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (lang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order')}
            </button>
          </form>
        </div>

        <div className="checkout-summary-container">
          <h2 className="section-title-small">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
          <div className="checkout-items">
            {items.map(item => (
              <div key={item.item_code} className="checkout-item">
                <div className="item-img-mini">
                  {item.image && <img src={item.image} alt="" />}
                  <span className="item-qty-badge">{item.qty}</span>
                </div>
                <div className="item-name-mini">{item.item_name}</div>
                <div className="item-price-mini">{(item.price * item.qty).toFixed(2)} {item.currency}</div>
              </div>
            ))}
          </div>
          <div className="summary-footer">
            <div className="summary-row">
              <span>{lang === 'ar' ? 'المجموع' : 'Total'}</span>
              <span className="total-price">{total.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
