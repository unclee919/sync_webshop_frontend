import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createOrder, createPaymobIntention, getCheckoutSettings } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import StripePaymentForm from '../components/StripePaymentForm'
import './Cart.css'

export default function Checkout() {
  const { items, clear, total } = useCart()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const c = content || {}
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  
  // Settings state
  const [settings, setSettings] = useState(null)
  const [stripePromise, setStripePromise] = useState(null)
  
  // UI state
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settingsError, setSettingsError] = useState(null)

  const gatewayList = settings?.payment_gateways || []
  const currency = items[0]?.currency || 'GBP'

  useEffect(() => {
    getCheckoutSettings().then(data => {
      setSettings(data)
      setSettingsError(null)
      const gateways = data.payment_gateways || []
      setPaymentMethod(gateways.find(g => g.name === 'cod')?.name || gateways[0]?.name || 'cod')
      const stripeGateway = gateways.find(g => g.name === 'stripe')
      if (stripeGateway?.publishable_key) {
        setStripePromise(loadStripe(stripeGateway.publishable_key))
      }
      
      // Set default delivery date based on min_days
      const minDays = data.delivery_settings?.min_days || 1
      const date = new Date()
      date.setDate(date.getDate() + minDays)
      setDeliveryDate(date.toISOString().split('T')[0])
      
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setSettingsError(err.message)
      setLoading(false)
    })
  }, [])

  const shippingRule = settings?.shipping_rules?.[0]
  const threshold = shippingRule?.free_shipping_threshold || 0
  const shippingCost = (shippingRule && total < threshold) ? shippingRule.shipping_cost : 0
  const grandTotal = total + shippingCost

  async function handleConfirmOrder(stripePaymentIntentId = null) {
    setSubmitting(true)
    setError(null)
    try {
      const order = await createOrder({
        customer: { name, email, phone, address },
        items: items.map((i) => ({ item_code: i.item_code, qty: i.qty })),
        payment_method: paymentMethod,
        stripe_payment_intent: stripePaymentIntentId,
        delivery_date: deliveryDate,
        submit: true,
      })
      setResult(order)
      clear()
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'تعذر التحقق من المخزون والأسعار.' : 'We could not validate stock and pricing. Please review your cart and try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePaymobOrder() {
    setSubmitting(true)
    setError(null)
    try {
      const draft = await createOrder({
        customer: { name, email, phone, address },
        items: items.map((i) => ({ item_code: i.item_code, qty: i.qty })),
        payment_method: 'paymob',
        delivery_date: deliveryDate,
        submit: false,
      })
      const paymobGateway = gatewayList.find((gateway) => gateway.name === 'paymob')
      const intention = await createPaymobIntention({
        amount: draft.grand_total,
        currency: paymobGateway?.currency || draft.currency || currency,
        customer: { name, email, phone, address },
        items: items.map((i) => ({ item_code: i.item_code, item_name: i.item_name, qty: i.qty, price: i.price })),
        salesOrder: draft.sales_order,
        deliveryDate,
      })
      if (!intention?.checkout_url) throw new Error(lang === 'ar' ? 'تعذر فتح بوابة الدفع.' : 'Paymob did not return a checkout URL.')
      window.location.assign(intention.checkout_url)
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'تعذر بدء الدفع عبر Paymob.' : 'We could not start the Paymob payment.'))
      setSubmitting(false)
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (paymentMethod === 'cod') {
      await handleConfirmOrder()
    } else if (paymentMethod === 'paymob') {
      await handlePaymobOrder()
    } else if (paymentMethod === 'stripe') {
      setError(lang === 'ar' ? 'يرجى استخدام زر الدفع بعد إدخال بيانات البطاقة.' : 'Use the card payment button after entering your card details.')
    }
  }

  if (loading) return <div className="container">{lang === 'ar' ? 'جارٍ تحميل إعدادات الدفع...' : 'Loading checkout settings...'}</div>
  if (!items.length) return <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}><p className="dashboard-empty">{lang === 'ar' ? 'السلة فارغة.' : 'Your cart is empty.'} <Link to="/products">{lang === 'ar' ? 'العودة للمنتجات' : 'Return to products'}</Link></p></div>

  if (result) {
    return (
      <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
        <div className="checkout-success-card">
          <div className="success-icon">✓</div>
          <h1>{lang === 'ar' ? (c.order_success_title_ar || 'تم تقديم الطلب بنجاح') : (c.order_success_title_en || 'Order Placed Successfully')}</h1>
          <p>
            {lang === 'ar' ? 'رقم الطلب:' : 'Order Number:'} <strong>{result.sales_order}</strong>
          </p>
          <p>
            {lang === 'ar' ? 'الإجمالي:' : 'Total:'} <strong>{result.grand_total.toFixed(2)} {result.currency}</strong>
          </p>
          {result.shipping_cost > 0 && (
            <p>{lang === 'ar' ? 'شامل رسوم الشحن:' : 'Including shipping:'} {result.shipping_cost.toFixed(2)} {result.currency}</p>
          )}
          <div className="success-actions">
            <Link to="/products" className="btn-primary">
              {lang === 'ar' ? (c.continue_shopping_text_ar || 'مواصلة التسوق') : (c.continue_shopping_text_en || 'Continue Shopping')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{lang === 'ar' ? (c.checkout_title_ar || 'الدفع') : (c.checkout_title_en || 'Checkout')}</h1>
      {settingsError && <div className="error-message" role="alert">{settingsError}</div>}
      
      <div className="checkout-grid">
        <div className="checkout-form-container">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}</h2>
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
                <textarea required value={address} onChange={e => setAddress(e.target.value)} rows="2"></textarea>
              </div>
            </section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'موعد التوصيل' : 'Delivery Date'}</h2>
              <div className="form-group">
                <input 
                  type="date" 
                  required 
                  value={deliveryDate} 
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDeliveryDate(e.target.value)} 
                />
                <p className="form-hint">
                  {lang === 'ar' ? 'اختر موعد التوصيل المفضل لديك' : 'Select your preferred delivery date'}
                </p>
              </div>
            </section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h2>
              <div className="payment-methods">
                {gatewayList.map(gw => (
                  <label key={gw.name} className={`payment-method-option ${paymentMethod === gw.name ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={gw.name} 
                      checked={paymentMethod === gw.name}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <span>{lang === 'ar' ? (gw.label_ar || gw.label) : (gw.label_en || gw.label)}</span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'stripe' && stripePromise && (
                <div className="stripe-payment-box">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm 
                      customer={{ name, email, phone }}
                      amount={grandTotal}
                      currency={currency}
                      onPaymentSuccess={(id) => handleConfirmOrder(id)}
                    />
                  </Elements>
                </div>
              )}
            </section>
            
            {error && <div className="error-message">{error}</div>}
            
            {(paymentMethod === 'cod' || paymentMethod === 'paymob') && (
              <button type="submit" className="place-order-btn" disabled={submitting}>
                {submitting ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (paymentMethod === 'paymob' ? (lang === 'ar' ? 'المتابعة إلى الدفع' : 'Continue to Paymob') : (lang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'))}
              </button>
            )}
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
              <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{total.toFixed(2)} {currency}</span>
            </div>
            <div className="summary-row">
              <span>{lang === 'ar' ? 'الشحن' : 'Shipping'}</span>
              <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)} ${currency}` : (lang === 'ar' ? 'مجاني' : 'Free')}</span>
            </div>
            <div className="summary-row total-row">
              <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span className="total-price">{grandTotal.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
