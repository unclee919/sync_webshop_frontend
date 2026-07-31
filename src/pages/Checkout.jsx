import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createOrder, getCheckoutSettings, createPaymentIntent } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import StripePaymentForm from '../components/StripePaymentForm'
import './Cart.css'

export default function Checkout() {
  const { items, clear, total } = useCart()
  const { lang, isRtl } = useLanguage()
  
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

  const currency = items[0]?.currency || 'GBP'

  useEffect(() => {
    getCheckoutSettings().then(data => {
      setSettings(data)
      const stripeGateway = data.payment_gateways.find(g => g.name === 'stripe')
      if (stripeGateway) {
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
        items: items.map((i) => ({ item_code: i.item_code, qty: i.qty, price: i.price })),
        payment_method: paymentMethod,
        stripe_payment_intent: stripePaymentIntentId,
        delivery_date: deliveryDate,
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

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    
    if (paymentMethod === 'cod') {
      await handleConfirmOrder()
    } else if (paymentMethod === 'stripe') {
      // For Stripe, the confirmation happens inside StripePaymentForm 
      // which then calls onPaymentSuccess -> handleConfirmOrder
      // So we just trigger the form submission if needed, 
      // but here we'll handle the logic for Stripe confirmation.
      setSubmitting(true)
      try {
        const { clientSecret } = await createPaymentIntent(grandTotal, currency)
        // In a real app, we'd use the clientSecret with stripe.confirmCardPayment
        // For this MVP, we'll simulate the success or expect the user to have 
        // a more integrated Stripe flow.
        // Let's assume the StripePaymentForm will handle the actual payment.
        setError(lang === 'ar' ? 'يرجى إكمال بيانات البطاقة' : 'Please complete card details')
        setSubmitting(false)
      } catch (err) {
        setError(err.message)
        setSubmitting(false)
      }
    }
  }

  if (loading) return <div className="container">Loading...</div>

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
            {lang === 'ar' ? 'الإجمالي:' : 'Total:'} <strong>{result.grand_total.toFixed(2)} {result.currency}</strong>
          </p>
          {result.shipping_cost > 0 && (
            <p>{lang === 'ar' ? 'شامل رسوم الشحن:' : 'Including shipping:'} {result.shipping_cost.toFixed(2)} {result.currency}</p>
          )}
          <div className="success-actions">
            <Link to="/products" className="btn-primary">
              {lang === 'ar' ? 'مواصلة التسوق' : 'Continue Shopping'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{lang === 'ar' ? 'الدفع' : 'Checkout'}</h1>
      
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
                {settings?.payment_gateways.map(gw => (
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
            
            {paymentMethod === 'cod' && (
              <button type="submit" className="place-order-btn" disabled={submitting}>
                {submitting ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (lang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order')}
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
