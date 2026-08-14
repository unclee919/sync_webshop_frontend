import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createOrder, createPaymobIntention, getCheckoutSettings, getTerritories, validateCoupon } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import StripePaymentForm from '../components/StripePaymentForm'
import GiftOptions from '../components/GiftOptions'
import { formatStorefrontPrice } from '../utils/currency'
import SearchableSelect from '../components/SearchableSelect'
import './Cart.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[+0-9 ()-]{7,}$/

function PaymentIcon({ name }) {
  const common = { width: 34, height: 24, viewBox: '0 0 34 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  if (name === 'cod') return <svg {...common} aria-label="Cash on delivery"><rect x="1" y="2" width="32" height="20" rx="5" fill="#ECFDF5" stroke="#A7F3D0"/><path d="M8 8h18v8H8V8Z" fill="#16A34A"/><circle cx="17" cy="12" r="2.5" fill="#FDE68A"/><path d="M10 10h2M22 14h2" stroke="#DCFCE7" strokeWidth="1.2" strokeLinecap="round"/></svg>
  if (name === 'apple_pay') return <svg {...common} aria-label="Apple Pay"><rect x="1" y="2" width="32" height="20" rx="5" fill="#111827"/><path d="M16.8 8.1c.6-.7.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.1-.5.6-.9 1.5-.8 2.3.9.1 1.7-.4 2.2-1Z" fill="white"/><path d="M19.2 12.1c0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1-.9-.1-1.8.5-2.2.5-.5 0-1.2-.5-2-.5-1 0-2 .6-2.5 1.5-1.1 1.9-.3 4.7.8 6.3.5.8 1.1 1.6 1.9 1.6.8 0 1.1-.5 2-.5.9 0 1.2.5 2 .5.8 0 1.3-.8 1.8-1.6.6-.9.8-1.8.8-1.9-.1 0-1.7-.7-1.7-2.5Z" fill="white"/></svg>
  if (name === 'visa' || name === 'stripe' || name === 'paymob') return <svg {...common} aria-label="Visa or card"><rect x="1" y="2" width="32" height="20" rx="5" fill="#fff" stroke="#CBD5E1"/><path d="M6 15.6 8.4 8h2.3l-2.4 7.6H6Z" fill="#1D4ED8"/><path d="m12 15.6 2.5-7.6h2.3l-2.5 7.6H12Z" fill="#F59E0B"/><path d="M19.2 8.1c.6-.1 1.5-.2 2.2-.2 1.7 0 2.8.7 2.8 2 0 1.8-1.8 2.2-3.2 2.6-.6.2-.9.4-.9.7 0 .3.3.5.9.5.7 0 1.5-.2 2-.4l-.3 1.8c-.5.2-1.2.3-2 .3-1.5 0-2.9-.6-2.9-2 0-1.6 1.4-2.2 2.8-2.6.8-.2 1.2-.4 1.2-.8 0-.3-.4-.5-1-.5-.7 0-1.4.2-1.9.3l.3-1.7Z" fill="#1E3A8A"/></svg>
  if (name === 'mada') return <svg {...common} aria-label="Mada"><rect x="1" y="2" width="32" height="20" rx="5" fill="#fff" stroke="#CBD5E1"/><path d="M7 15.2c1.2-3.6 2.5-5.4 4-5.4 1 0 1.6.8 2.1 2.1.6-1.4 1.4-2.1 2.4-2.1 1.4 0 2.1 1.7 2.9 5.4h-2.2c-.4-1.7-.7-2.7-1.1-2.7-.4 0-.8 1.1-1.4 2.7h-1.9c-.5-1.5-.9-2.7-1.3-2.7-.4 0-.8 1-1.4 2.7H7Z" fill="#0F766E"/><path d="M21 9.8h5.6v1.6h-3.5v1.1h3.1v1.5h-3.1v1.2h3.6v1.6H21V9.8Z" fill="#7C3AED"/></svg>
  if (name === 'tabby') return <svg {...common} aria-label="Tabby"><rect x="1" y="2" width="32" height="20" rx="5" fill="#E8F7F0" stroke="#A7F3D0"/><path d="M8 8h4v8H8V8Zm6 0h4v8h-4V8Zm6 0h4v8h-4V8Z" fill="#16A34A"/><path d="M9 18h14" stroke="#166534" strokeWidth="1.5" strokeLinecap="round"/></svg>
  if (name === 'tamara') return <svg {...common} aria-label="Tamara"><rect x="1" y="2" width="32" height="20" rx="5" fill="#111827"/><path d="M8 9h11v2H8V9Zm0 3h8v2H8v-2Zm0 3h5v2H8v-2Z" fill="#A7F3D0"/><path d="M23 8.5c1.7 0 3 1.3 3 3s-1.3 3-3 3h-1v2h-2v-8h3Zm-1 2v2h1c.6 0 1-.4 1-1s-.4-1-1-1h-1Z" fill="#FDE68A"/></svg>
  if (name === 'wallet') return <svg {...common} aria-label="Mobile wallet"><rect x="8" y="2" width="18" height="20" rx="3" fill="#F3E8FF" stroke="#7C3AED"/><path d="M12 6h10M12 9h6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 14h4v3h-4a1.5 1.5 0 0 1 0-3Z" fill="#7C3AED"/><circle cx="19.5" cy="15.5" r=".7" fill="white"/></svg>
  if (name === 'value') return <svg {...common} aria-label="valu"><rect x="1" y="2" width="32" height="20" rx="5" fill="#FFF7ED" stroke="#FDBA74"/><path d="M8 8.5h3l2.1 5.8 2.1-5.8h3L15 16h-3L8 8.5Zm12 0h2.5c2.4 0 3.5 1.5 3.5 3.7 0 2.3-1.1 3.8-3.5 3.8H20v-7.5Zm2.6 5.6c.9 0 1.3-.6 1.3-1.9 0-1.2-.4-1.8-1.3-1.8h-.5v3.7h.5Z" fill="#EA580C"/></svg>
  return <svg {...common} aria-label="Payment card"><rect x="1" y="2" width="32" height="20" rx="5" fill="#fff" stroke="#CBD5E1"/><path d="M6 8h22v3H6V8Z" fill="#0F766E"/><path d="M8 15h7M18 15h5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/></svg>
}

export default function Checkout() {
  const { items, clear, total } = useCart()
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const routerLocation = useLocation()
  const isExpress = new URLSearchParams(routerLocation.search).get('express') === '1'
  const c = content || {}

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [secondPhone, setSecondPhone] = useState('')
  const [address, setAddress] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [fulfillmentMethod, setFulfillmentMethod] = useState('Delivery')
  const [pickupWarehouse, setPickupWarehouse] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponMessage, setCouponMessage] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const [settings, setSettings] = useState(null)
  const [territories, setTerritories] = useState([])
  const [stripePromise, setStripePromise] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settingsError, setSettingsError] = useState(null)
  const [contactTouched, setContactTouched] = useState(false)
  const [giftOptions, setGiftOptions] = useState({ wrap: false, message: '' })
  const [regionalPaymentOptions, setRegionalPaymentOptions] = useState([])

  const gatewayList = settings?.payment_gateways || []
  const fulfillment = settings?.fulfillment || {}
  const paymobGateway = gatewayList.find((gateway) => gateway.name === 'paymob')
  const currency = items[0]?.currency || c.master_settings?.currencies?.supported?.[0] || 'SAR'
  const cities = useMemo(() => territories.find((row) => row.governorate === governorate)?.cities || [], [territories, governorate])
  const requireTerritory = settings?.checkout_require_city_governorate ?? true
  const requireSecondPhone = settings?.checkout_require_second_phone ?? true
  const shippingRule = settings?.shipping_rules?.[0]
  const shippingCost = shippingRule && total < Number(shippingRule.free_shipping_threshold || 0) ? Number(shippingRule.shipping_cost || 0) : 0
  const discount = Math.min(Number(coupon?.discount_amount || 0), total)
  const grandTotal = Math.max(0, total - discount) + shippingCost
  const emailIsValid = emailPattern.test(email.trim())
  const phoneIsValid = phonePattern.test(phone.trim())
  const secondPhoneIsValid = !requireSecondPhone || phonePattern.test(secondPhone.trim())

  useEffect(() => {
    if (!isExpress) return
    try {
      const customer = JSON.parse(localStorage.getItem('sync_webshop_customer') || 'null')
      const profile = customer?.customer || customer?.profile || customer
      if (profile) {
        setName(profile.full_name || profile.customer_name || profile.name || '')
        setEmail(profile.email || profile.email_id || '')
        setPhone(profile.phone || profile.mobile_no || '')
        setSecondPhone(profile.second_phone || profile.secondary_phone || '')
        setAddress(profile.address || profile.address_line1 || '')
        setGovernorate(profile.governorate || profile.state || '')
        setCity(profile.city || '')
        setLocation(profile.location || profile.location_address || '')
      }
    } catch { /* ignore unavailable session data */ }
  }, [isExpress])

  useEffect(() => {
    Promise.all([getCheckoutSettings(), getTerritories()]).then(([data, territoryRows]) => {
      setSettings(data || {})
      setRegionalPaymentOptions(Array.isArray(data?.regional_payment_options) ? data.regional_payment_options : [])
      setTerritories(Array.isArray(territoryRows) ? territoryRows : [])
      setSettingsError(null)
      const gateways = data?.payment_gateways || []
      setPaymentMethod(gateways.find((gateway) => gateway.name === 'cod')?.name || gateways[0]?.name || 'cod')
      const stripeGateway = gateways.find((gateway) => gateway.name === 'stripe')
      if (stripeGateway?.publishable_key) setStripePromise(loadStripe(stripeGateway.publishable_key))
      const date = new Date()
      date.setDate(date.getDate() + (data?.delivery_settings?.min_days || 1))
      setDeliveryDate(date.toISOString().split('T')[0])
    }).catch((err) => setSettingsError(err.message)).finally(() => setLoading(false))
  }, [])

  function customerPayload() {
    return { name, email, phone, second_phone: secondPhone, address, governorate, city, location, coupon_code: coupon?.coupon_code, gift_message: giftOptions.message, gift_wrap: giftOptions.wrap }
  }

  async function handleApplyCoupon(event) {
    event?.preventDefault()
    const code = couponCode.trim()
    if (!code || couponLoading || coupon) return
    setCouponLoading(true)
    setCouponMessage(null)
    try {
      const validated = await validateCoupon(code, total)
      setCoupon(validated)
      setCouponMessage({ type: 'success', text: lang === 'ar' ? `تم تطبيق الخصم: ${formatStorefrontPrice(validated.discount_amount, currency, content)}` : `Coupon applied: ${formatStorefrontPrice(validated.discount_amount, currency, content)}` })
    } catch (err) {
      setCoupon(null)
      setCouponMessage({ type: 'error', text: err.message })
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCoupon(null)
    setCouponCode('')
    setCouponMessage(null)
  }

  async function handleConfirmOrder(stripePaymentIntentId = null, submit = true) {
    setSubmitting(true)
    setError(null)
    try {
      const order = await createOrder({
        customer: customerPayload(),
        items: items.map((item) => ({ item_code: item.item_code, qty: item.qty })),
        payment_method: paymentMethod,
        fulfillment_method: fulfillmentMethod,
        pickup_warehouse: pickupWarehouse,
        stripe_payment_intent: stripePaymentIntentId,
        delivery_date: deliveryDate,
        coupon_code: coupon?.coupon_code,
        governorate,
        city,
        location,
        second_phone: secondPhone,
        gift_message: giftOptions.message,
        gift_wrap: giftOptions.wrap,
        submit,
      })
      if (submit) {
        setResult(order)
        clear()
      }
      return order
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'تعذر التحقق من المخزون والأسعار.' : 'We could not validate stock and pricing.'))
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePaymobOrder() {
    setSubmitting(true)
    setError(null)
    try {
      const draft = await createOrder({ customer: customerPayload(), items: items.map((item) => ({ item_code: item.item_code, qty: item.qty })), payment_method: paymentMethod, delivery_date: deliveryDate, fulfillment_method: fulfillmentMethod, pickup_warehouse: pickupWarehouse, coupon_code: coupon?.coupon_code, governorate, city, location, second_phone: secondPhone, gift_message: giftOptions.message, gift_wrap: giftOptions.wrap, submit: false })
      const paymobGateway = gatewayList.find((gateway) => gateway.name === 'paymob')
      const intention = await createPaymobIntention({ amount: draft.grand_total, currency: paymobGateway?.currency || draft.currency || currency, customer: customerPayload(), items: items.map((item) => ({ item_code: item.item_code, item_name: item.item_name, qty: item.qty, price: item.price })), salesOrder: draft.sales_order, deliveryDate })
      if (!intention?.checkout_url) throw new Error(lang === 'ar' ? 'تعذر فتح بوابة الدفع.' : 'Paymob did not return a checkout URL.')
      window.location.assign(intention.checkout_url)
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'تعذر بدء الدفع عبر Paymob.' : 'We could not start the Paymob payment.'))
      setSubmitting(false)
    }
  }

  async function handleSubmit(event) {
    event?.preventDefault()
    setContactTouched(true)
    if (!emailIsValid || !phoneIsValid || !secondPhoneIsValid) {
      setError(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني ورقم هاتف صالحين.' : 'Please enter a valid email address and phone number.')
      return
    }
    if (requireTerritory && (!governorate || !city)) {
      setError(lang === 'ar' ? 'يرجى اختيار المحافظة والمدينة.' : 'Please select a governorate and city.')
      return
    }
    if (paymentMethod === 'cod') await handleConfirmOrder()
    else if (paymentMethod === 'paymob' || ['tabby', 'tamara', 'mada', 'apple_pay', 'wallet', 'value', 'visa'].includes(paymentMethod)) await handlePaymobOrder()
    else if (paymentMethod === 'stripe') setError(lang === 'ar' ? 'يرجى استخدام زر الدفع بعد إدخال بيانات البطاقة.' : 'Use the card payment button after entering your card details.')
  }

  if (loading) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>{lang === 'ar' ? 'جارٍ تحميل إعدادات الدفع...' : 'Loading checkout settings...'}</div>

  if (!items.length && !result) return (
    <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`} style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div className="empty-cart-card" style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#111' }}>
          {lang === 'ar' ? 'سلة التسوق فارغة' : 'Your Shopping Cart is Empty'}
        </h2>
        <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
          {lang === 'ar' ? 'يبدو أنك لم تقم بإضافة أي منتجات إلى سلتك حتى الآن. استكشف تشكيلتنا الفاخرة وابدأ التسوق.' : 'It looks like you haven’t added any items to your cart yet. Explore our luxury collection and start shopping.'}
        </p>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-block', padding: '12px 28px', background: '#064e3b', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          {lang === 'ar' ? 'العودة للمنتجات' : 'Return to products'}
        </Link>
      </div>
    </div>
  )

  if (result) return (
    <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`} style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="checkout-success-card" style={{ maxWidth: '600px', width: '100%', background: '#fff', padding: '50px 40px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', textAlign: 'center', border: '1px solid #e5e7eb' }}>
        <div className="success-icon" style={{ width: '80px', height: '80px', background: '#d1fae5', color: '#065f46', fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: '0 auto 24px' }}>✓</div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
          {lang === 'ar' ? 'تهانينا! تم تأكيد طلبك بنجاح' : 'Congratulations! Order Placed Successfully'}
        </h1>
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
          {lang === 'ar' ? 'شكراً لتسوقك معنا. نحن نقوم حالياً بتجهيز طلبك بعناية فائقة وتوصيله إلى عنوانك.' : 'Thank you for your purchase. We are carefully preparing your order for prompt delivery.'}
        </p>
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '30px', textAlign: isRtl ? 'right' : 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'رقم الطلب:' : 'Order Number:'}</span>
            <strong style={{ color: '#111827' }}>{result.sales_order}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'المبلغ الإجمالي:' : 'Grand Total:'}</span>
            <strong style={{ color: '#065f46' }}>{formatStorefrontPrice(result.grand_total, result.currency, content)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>{lang === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}</span>
            <strong style={{ color: '#2563eb' }}>{paymentMethod === 'cod' ? (lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery') : (lang === 'ar' ? 'مدفوع إلكترونياً' : 'Paid Online')}</strong>
          </div>
        </div>
        <div className="success-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/products" className="btn-primary" style={{ padding: '14px 32px', background: '#064e3b', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 4px 12px rgba(6,78,59,0.2)' }}>
            {lang === 'ar' ? 'مواصلة التسوق' : 'Continue Shopping'}
          </Link>
          <Link to="/dashboard" className="btn-secondary" style={{ padding: '14px 32px', background: '#f3f4f6', color: '#374151', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
            {lang === 'ar' ? 'لوحة التحكم' : 'Customer Dashboard'}
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{lang === 'ar' ? (c.checkout_title_ar || 'الدفع') : (c.checkout_title_en || 'Checkout')}</h1>
      {isExpress && <div className="express-checkout-banner"><strong>{lang === 'ar' ? 'تجربة شراء سريعة' : 'Express checkout'}</strong><span>{lang === 'ar' ? 'تم تحميل بيانات حسابك المحفوظة لتسريع الطلب.' : 'Your saved account details are loaded to speed up this order.'}</span></div>}
      {settingsError && <div className="error-message" role="alert">{settingsError}</div>}
      <div className="checkout-grid">
        <div className="checkout-form-container">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}</h2>
              <div className="form-group"><label>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label><input required value={name} onChange={(event) => setName(event.target.value)} /></div>
              <div className="form-row"><div className="form-group"><label>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label><input type="email" required inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => setContactTouched(true)} aria-invalid={contactTouched && !emailIsValid} />{contactTouched && !emailIsValid && <p className="field-error">{lang === 'ar' ? 'أدخل بريداً إلكترونياً صالحاً.' : 'Enter a valid email address.'}</p>}</div><div className="form-group"><label>{lang === 'ar' ? 'رقم الهاتف الأساسي' : 'Primary Phone'}</label><input required pattern="[+0-9 ()-]{7,}" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} onBlur={() => setContactTouched(true)} aria-invalid={contactTouched && !phoneIsValid} />{contactTouched && !phoneIsValid && <p className="field-error">{lang === 'ar' ? 'أدخل رقم هاتف صالحاً.' : 'Enter a valid phone number.'}</p>}</div></div>
              <div className="form-group"><label>{lang === 'ar' ? 'رقم هاتف إضافي' : 'Second Phone Number'}{requireSecondPhone ? ' *' : ''}</label><input required={requireSecondPhone} pattern="[+0-9 ()-]{7,}" inputMode="tel" value={secondPhone} onChange={(event) => setSecondPhone(event.target.value)} onBlur={() => setContactTouched(true)} aria-invalid={contactTouched && !secondPhoneIsValid} />{contactTouched && !secondPhoneIsValid && <p className="field-error">{lang === 'ar' ? 'أدخل رقم الهاتف الإضافي.' : 'Enter the second phone number.'}</p>}</div>
              <div className="form-row"><div className="form-group"><SearchableSelect label={lang === 'ar' ? 'المحافظة' : 'Governorate'} value={governorate} options={territories.map((row) => row.governorate)} placeholder={lang === 'ar' ? 'اختر المحافظة' : 'Select governorate'} required={requireTerritory} isRtl={isRtl} onChange={(value) => { setGovernorate(value); setCity('') }} /></div><div className="form-group"><SearchableSelect label={lang === 'ar' ? 'المدينة' : 'City'} value={city} options={cities} placeholder={lang === 'ar' ? 'اختر المدينة' : 'Select city'} required={requireTerritory} disabled={!governorate} isRtl={isRtl} onChange={setCity} /></div></div>
              <div className="form-group"><label>{lang === 'ar' ? 'العنوان بالتفصيل' : 'Detailed Address'}</label><textarea required value={address} onChange={(event) => setAddress(event.target.value)} rows="2" /></div>
              <div className="form-group"><label>{lang === 'ar' ? 'رابط الموقع الجغرافي (اختياري)' : 'Optional Location'}</label><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={lang === 'ar' ? 'رابط خريطة أو معلم قريب' : 'Map link or nearby landmark'} /></div>
            </section>

            <section className="checkout-section"><h2 className="section-title-small">{lang === 'ar' ? 'رمز الخصم' : 'Coupon Code'}</h2><div className="coupon-form"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder={lang === 'ar' ? (settings?.coupon_placeholder_ar || 'أدخل كود الخصم') : (settings?.coupon_placeholder_en || 'Enter coupon code')} disabled={Boolean(coupon)} /><button type="button" onClick={handleApplyCoupon} disabled={couponLoading || Boolean(coupon)}>{couponLoading ? '...' : (lang === 'ar' ? 'تطبيق' : 'Apply')}</button>{coupon && <button type="button" className="coupon-remove" onClick={removeCoupon}>{lang === 'ar' ? 'إزالة' : 'Remove'}</button>}</div>{couponMessage && <p className={`coupon-message ${couponMessage.type}`}>{couponMessage.text}</p>}</section>

            <GiftOptions value={giftOptions} onChange={setGiftOptions} />

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'طريقة الاستلام' : 'Fulfillment'}</h2>
              <div className="payment-methods">
                <label className={`payment-method-option ${fulfillmentMethod === 'Delivery' ? 'active' : ''}`}><input type="radio" name="fulfillmentMethod" value="Delivery" checked={fulfillmentMethod === 'Delivery'} onChange={() => { setFulfillmentMethod('Delivery'); setPickupWarehouse('') }} /><span>{lang === 'ar' ? 'التوصيل' : 'Delivery'}</span></label>
                {fulfillment.pickup_enabled && <label className={`payment-method-option ${fulfillmentMethod === 'Store Pickup' ? 'active' : ''}`}><input type="radio" name="fulfillmentMethod" value="Store Pickup" checked={fulfillmentMethod === 'Store Pickup'} onChange={() => setFulfillmentMethod('Store Pickup')} /><span>{lang === 'ar' ? (fulfillment.pickup_title_ar || 'الاستلام من المتجر') : (fulfillment.pickup_title_en || 'Store pickup')}</span></label>}
              </div>
              {fulfillmentMethod === 'Store Pickup' && <div className="form-group"><p className="form-hint">{lang === 'ar' ? (fulfillment.pickup_note_ar || 'اختر مستودعاً متاحاً لاستلام طلبك منه.') : (fulfillment.pickup_note_en || 'Choose an available warehouse and collect your order there.')}</p><select required value={pickupWarehouse} onChange={(event) => setPickupWarehouse(event.target.value)}><option value="">{lang === 'ar' ? 'اختر موقع الاستلام' : 'Select pickup location'}</option>{(fulfillment.warehouses || []).map((warehouse) => <option key={warehouse.name} value={warehouse.name}>{warehouse.warehouse_name || warehouse.name}{warehouse.city ? ` · ${warehouse.city}` : ''}</option>)}</select></div>}
            </section>

            <section className="checkout-section"><h2 className="section-title-small">{lang === 'ar' ? 'موعد التوصيل' : 'Delivery Date'}</h2><div className="form-group"><input type="date" required value={deliveryDate} min={new Date().toISOString().split('T')[0]} onChange={(event) => setDeliveryDate(event.target.value)} /><p className="form-hint">{lang === 'ar' ? 'اختر موعد التوصيل المفضل لديك' : 'Select your preferred delivery date'}</p></div></section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h2>
              <div className="payment-methods" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {gatewayList.map((gateway) => (
                  <label key={gateway.name} className={`payment-method-option ${paymentMethod === gateway.name ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', background: paymentMethod === gateway.name ? '#f0fdf4' : '#fff' }}>
                    <input type="radio" name="paymentMethod" value={gateway.name} checked={paymentMethod === gateway.name} onChange={(event) => setPaymentMethod(event.target.value)} />
                    <span className="payment-method-icon" aria-hidden="true"><PaymentIcon name={gateway.name} /></span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>{lang === 'ar' ? (gateway.label_ar || gateway.label) : (gateway.label_en || gateway.label)}</span>
                  </label>
                ))}
                {regionalPaymentOptions.map((option) => (
                  <label key={option.name} className={`payment-method-option ${paymentMethod === option.name ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', background: paymentMethod === option.name ? '#f0fdf4' : '#fff' }}>
                    <input type="radio" name="paymentMethod" value={option.name} checked={paymentMethod === option.name} onChange={(event) => setPaymentMethod(event.target.value)} />
                    <span className="payment-method-icon" aria-hidden="true"><PaymentIcon name={option.name} /></span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>{lang === 'ar' ? option.label_ar || option.label : option.label}</span>
                  </label>
                ))}
              </div>
              {paymentMethod === 'paymob' && paymobGateway && <p className="form-hint" style={{ marginTop: '10px', color: '#4b5563' }}>{lang === 'ar' ? (paymobGateway.note_ar || 'ادفع بأمان عبر Paymob (بطاقة ائتمان، محفظة إلكترونية، وغيرها)') : (paymobGateway.note_en || 'Pay securely through Paymob (Card, Mobile Wallet, etc.)')}</p>}
              {paymentMethod === 'stripe' && stripePromise && <div className="stripe-payment-box" style={{ marginTop: '15px' }}><Elements stripe={stripePromise}><StripePaymentForm customer={{ name, email, phone }} amount={grandTotal} currency={currency} onPaymentSuccess={(id) => handleConfirmOrder(id)} /></Elements></div>}
            </section>

            {error && <div className="error-message" style={{ marginTop: '15px', color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>{error}</div>}
            <button type="submit" className="place-order-btn" disabled={submitting} style={{ width: '100%', marginTop: '20px', padding: '16px', background: '#064e3b', color: '#fff', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
              {submitting ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (paymentMethod !== 'cod' ? (lang === 'ar' ? 'المتابعة إلى الدفع الآمن' : 'Continue to Secure Payment') : (lang === 'ar' ? 'تأكيد الطلب (الدفع عند الاستلام)' : 'Confirm Order (Cash on Delivery)'))}
            </button>
          </form>
        </div>

        <div className="checkout-summary-container">
          <h2 className="section-title-small">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
          <div className="checkout-items">
            {items.map((item) => (
              <div key={item.item_code} className="checkout-item">
                <div className="item-img-mini">{item.image && <img src={item.image} alt="" />}<span className="item-qty-badge">{item.qty}</span></div>
                <div className="item-name-mini">{item.item_name}</div>
                <div className="item-price-mini">{formatStorefrontPrice(item.price * item.qty, item.currency, content)}</div>
              </div>
            ))}
          </div>
          <div className="summary-footer">
            <div className="summary-row"><span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{formatStorefrontPrice(total, currency, content)}</span></div>
            {discount > 0 && <div className="summary-row discount-row"><span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span><span>-{formatStorefrontPrice(discount, currency, content)}</span></div>}
            <div className="summary-row"><span>{lang === 'ar' ? 'الشحن' : 'Shipping'}</span><span>{shippingCost > 0 ? formatStorefrontPrice(shippingCost, currency, content) : (lang === 'ar' ? 'مجاني' : 'Free')}</span></div>
            <div className="summary-row total-row"><span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span><span className="total-price">{formatStorefrontPrice(grandTotal, currency, content)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
