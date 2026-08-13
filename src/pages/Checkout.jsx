import { useEffect, useMemo, useState } from 'react'
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
  const currency = items[0]?.currency || c.master_settings?.currencies?.supported?.[0] || ''
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
      const draft = await createOrder({ customer: customerPayload(), items: items.map((item) => ({ item_code: item.item_code, qty: item.qty })), payment_method: 'paymob', delivery_date: deliveryDate, fulfillment_method: fulfillmentMethod, pickup_warehouse: pickupWarehouse, coupon_code: coupon?.coupon_code, governorate, city, location, second_phone: secondPhone, gift_message: giftOptions.message, gift_wrap: giftOptions.wrap, submit: false })
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
    else if (paymentMethod === 'paymob') await handlePaymobOrder()
    else if (paymentMethod === 'stripe') setError(lang === 'ar' ? 'يرجى استخدام زر الدفع بعد إدخال بيانات البطاقة.' : 'Use the card payment button after entering your card details.')
  }

  if (loading) return <div className="container">{lang === 'ar' ? 'جارٍ تحميل إعدادات الدفع...' : 'Loading checkout settings...'}</div>
  if (!items.length) return <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}><p className="dashboard-empty">{lang === 'ar' ? 'السلة فارغة.' : 'Your cart is empty.'} <Link to="/products">{lang === 'ar' ? 'العودة للمنتجات' : 'Return to products'}</Link></p></div>

  if (result) return (
    <div className={`checkout-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="checkout-success-card">
        <div className="success-icon">✓</div>
        <h1>{lang === 'ar' ? (c.order_success_title_ar || 'تم تقديم الطلب بنجاح') : (c.order_success_title_en || 'Order Placed Successfully')}</h1>
        <p>{lang === 'ar' ? 'رقم الطلب:' : 'Order Number:'} <strong>{result.sales_order}</strong></p>
        <p>{lang === 'ar' ? 'الإجمالي:' : 'Total:'} <strong>{formatStorefrontPrice(result.grand_total, result.currency, content)}</strong></p>
        {Number(result.coupon_discount || 0) > 0 && <p>{lang === 'ar' ? 'الخصم:' : 'Discount:'} {formatStorefrontPrice(result.coupon_discount, result.currency, content)}</p>}
        {Number(result.shipping_cost || 0) > 0 && <p>{lang === 'ar' ? 'شامل رسوم الشحن:' : 'Including shipping:'} {formatStorefrontPrice(result.shipping_cost, result.currency, content)}</p>}
        <div className="success-actions"><Link to="/products" className="btn-primary">{lang === 'ar' ? (c.continue_shopping_text_ar || 'مواصلة التسوق') : (c.continue_shopping_text_en || 'Continue Shopping')}</Link></div>
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
              <div className="form-group"><label>{lang === 'ar' ? 'موقع إضافي (اختياري)' : 'Optional Location'}</label><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={lang === 'ar' ? 'رابط خرائط أو علامة مميزة' : 'Map link or nearby landmark'} /></div>
            </section>

            <section className="checkout-section"><h2 className="section-title-small">{lang === 'ar' ? 'رمز الخصم' : 'Coupon Code'}</h2><div className="coupon-form"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder={lang === 'ar' ? (settings?.coupon_placeholder_ar || 'أدخل كود الخصم') : (settings?.coupon_placeholder_en || 'Enter coupon code')} disabled={Boolean(coupon)} /><button type="button" onClick={handleApplyCoupon} disabled={couponLoading || Boolean(coupon)}>{couponLoading ? '...' : (lang === 'ar' ? 'تطبيق' : 'Apply')}</button>{coupon && <button type="button" className="coupon-remove" onClick={removeCoupon}>{lang === 'ar' ? 'إزالة' : 'Remove'}</button>}</div>{couponMessage && <p className={`coupon-message ${couponMessage.type}`}>{couponMessage.text}</p>}</section>

            <GiftOptions value={giftOptions} onChange={setGiftOptions} />

            <section className="checkout-section"><h2 className="section-title-small">{lang === 'ar' ? 'طريقة الاستلام' : 'Fulfillment'}</h2><div className="payment-methods"><label className={`payment-method-option ${fulfillmentMethod === 'Delivery' ? 'active' : ''}`}><input type="radio" name="fulfillmentMethod" value="Delivery" checked={fulfillmentMethod === 'Delivery'} onChange={() => { setFulfillmentMethod('Delivery'); setPickupWarehouse('') }} /><span>{lang === 'ar' ? 'التوصيل' : 'Delivery'}</span></label>{fulfillment.pickup_enabled && <label className={`payment-method-option ${fulfillmentMethod === 'Store Pickup' ? 'active' : ''}`}><input type="radio" name="fulfillmentMethod" value="Store Pickup" checked={fulfillmentMethod === 'Store Pickup'} onChange={() => setFulfillmentMethod('Store Pickup')} /><span>{lang === 'ar' ? (fulfillment.pickup_title_ar || 'الاستلام من المتجر') : (fulfillment.pickup_title_en || 'Store pickup')}</span></label>}</div>{fulfillmentMethod === 'Store Pickup' && <div className="form-group"><p className="form-hint">{lang === 'ar' ? (fulfillment.pickup_note_ar || 'اختر مستودعاً متاحاً لاستلام طلبك منه.') : (fulfillment.pickup_note_en || 'Choose an available warehouse and collect your order there.')}</p><select required value={pickupWarehouse} onChange={(event) => setPickupWarehouse(event.target.value)}><option value="">{lang === 'ar' ? 'اختر موقع الاستلام' : 'Select pickup location'}</option>{(fulfillment.warehouses || []).map((warehouse) => <option key={warehouse.name} value={warehouse.name}>{warehouse.warehouse_name || warehouse.name}{warehouse.city ? ` · ${warehouse.city}` : ''}</option>)}</select></div>}</section><section className="checkout-section"><h2 className="section-title-small">{lang === 'ar' ? 'موعد التوصيل' : 'Delivery Date'}</h2><div className="form-group"><input type="date" required value={deliveryDate} min={new Date().toISOString().split('T')[0]} onChange={(event) => setDeliveryDate(event.target.value)} /><p className="form-hint">{lang === 'ar' ? 'اختر موعد التوصيل المفضل لديك' : 'Select your preferred delivery date'}</p></div></section>

            <section className="checkout-section"><h2 className="section-title-small">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h2><div className="payment-methods">{gatewayList.map((gateway) => <label key={gateway.name} className={`payment-method-option ${paymentMethod === gateway.name ? 'active' : ''}`}><input type="radio" name="paymentMethod" value={gateway.name} checked={paymentMethod === gateway.name} onChange={(event) => setPaymentMethod(event.target.value)} /><span>{lang === 'ar' ? (gateway.label_ar || gateway.label) : (gateway.label_en || gateway.label)}</span></label>)}</div>{paymentMethod === 'paymob' && paymobGateway && <p className="form-hint">{lang === 'ar' ? (paymobGateway.note_ar || 'ادفع بأمان عبر Paymob') : (paymobGateway.note_en || 'Pay securely through Paymob')} {(paymobGateway.methods || []).map((method) => lang === 'ar' ? method.label_ar : method.label_en).join(' · ')}</p>}{regionalPaymentOptions.length > 0 && <p className="form-hint regional-payment-hint">{lang === 'ar' ? 'طرق دفع إقليمية مفعلة من لوحة التحكم: ' : 'Regional payment methods enabled in Desk: '}{regionalPaymentOptions.map((option) => `${lang === 'ar' ? option.label_ar : option.label_en}${option.safe_mode ? (lang === 'ar' ? ' (وضع آمن)' : ' (safe mode)') : ''}`).join(' · ')}</p>}{paymentMethod === 'stripe' && stripePromise && <div className="stripe-payment-box"><Elements stripe={stripePromise}><StripePaymentForm customer={{ name, email, phone }} amount={grandTotal} currency={currency} onPaymentSuccess={(id) => handleConfirmOrder(id)} /></Elements></div>}</section>
            {error && <div className="error-message">{error}</div>}
            {(paymentMethod === 'cod' || paymentMethod === 'paymob') && <button type="submit" className="place-order-btn" disabled={submitting}>{submitting ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (paymentMethod === 'paymob' ? (lang === 'ar' ? 'المتابعة إلى الدفع' : 'Continue to Paymob') : (lang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'))}</button>}
          </form>
        </div>

        <div className="checkout-summary-container"><h2 className="section-title-small">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2><div className="checkout-items">{items.map((item) => <div key={item.item_code} className="checkout-item"><div className="item-img-mini">{item.image && <img src={item.image} alt="" />}<span className="item-qty-badge">{item.qty}</span></div><div className="item-name-mini">{item.item_name}</div><div className="item-price-mini">{formatStorefrontPrice(item.price * item.qty, item.currency, content)}</div></div>)}</div><div className="summary-footer"><div className="summary-row"><span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{formatStorefrontPrice(total, currency, content)}</span></div>{discount > 0 && <div className="summary-row discount-row"><span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span><span>-{formatStorefrontPrice(discount, currency, content)}</span></div>}<div className="summary-row"><span>{lang === 'ar' ? 'الشحن' : 'Shipping'}</span><span>{shippingCost > 0 ? formatStorefrontPrice(shippingCost, currency, content) : (lang === 'ar' ? 'مجاني' : 'Free')}</span></div><div className="summary-row total-row"><span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span><span className="total-price">{formatStorefrontPrice(grandTotal, currency, content)}</span></div></div></div>
      </div>
    </div>
  )
}
