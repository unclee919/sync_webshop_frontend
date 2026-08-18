import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Cart.css'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createOrder, createPaymobIntention, getCheckoutSettings, getTerritories, validateCoupon } from '../api/client'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import StripePaymentForm from '../components/StripePaymentForm'
import { formatStorefrontPrice } from '../utils/currency'

export default function Checkout() {
  const cart = useCart()
  const { lang } = useLanguage()
  const { content } = useContent()
  const { items, total } = cart
  const navigate = useNavigate()
  const query = new URLSearchParams(useLocation().search)
  const isExpress = query.get('express') === '1'

  const [settings, setSettings] = useState(null)
  const [territories, setTerritories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [settingsError, setSettingsError] = useState(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [secondPhone, setSecondPhone] = useState('')
  const [address, setAddress] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [fulfillmentMethod, setFulfillmentMethod] = useState('Delivery')
  const [pickupWarehouse, setPickupWarehouse] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [paymobMethod, setPaymobMethod] = useState('visa')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState(null)
  const [giftOptions, setGiftOptions] = useState({ wrap: false, message: '' })
  const [stripePromise, setStripePromise] = useState(null)

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phonePattern = /^[0-9+]{8,15}$/

  const gatewayList = settings?.payment_gateways || []
  const fulfillment = settings?.fulfillment || {}
  const paymobGateway = gatewayList.find((gateway) => gateway.name === 'paymob')
  const currency = items[0]?.currency || content?.master_settings?.currencies?.supported?.[0] || 'SAR'
  const cities = useMemo(() => territories.find((row) => row.governorate === governorate)?.cities || [], [territories, governorate])
  const requireTerritory = settings?.checkout_require_city_governorate ?? true
  const requireSecondPhone = settings?.checkout_require_second_phone ?? true
  const regionalPaymentOptions = settings?.regional_payment_options || []

  const shippingRule = settings?.shipping_rules?.[0]
  const shippingCost = shippingRule && total < Number(shippingRule.free_shipping_threshold || 0) ? Number(shippingRule.shipping_cost || 0) : 0
  const discount = Math.min(Number(coupon?.discount_amount || 0), total)
  const grandTotal = Math.max(0, total - discount) + shippingCost

  const emailIsValid = emailPattern.test(email.trim())
  const phoneIsValid = phonePattern.test(phone.trim())
  const secondPhoneIsValid = !requireSecondPhone || phonePattern.test(secondPhone.trim())

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
      return
    }

    Promise.all([
      getCheckoutSettings(),
      getTerritories()
    ]).then(([data, territoryData]) => {
      setSettings(data)
      setTerritories(territoryData || [])

      const gateways = data?.payment_gateways || []
      setPaymentMethod(gateways.find((gateway) => gateway.name === 'cod')?.name || gateways[0]?.name || 'cod')

      const stripeGateway = gateways.find((gateway) => gateway.name === 'stripe')
      if (stripeGateway?.publishable_key) setStripePromise(loadStripe(stripeGateway.publishable_key))

      const date = new Date()
      date.setDate(date.getDate() + (data?.delivery_settings?.min_days || 1))
      setDeliveryDate(date.toISOString().split('T')[0])
    }).catch((err) => setSettingsError(err.message)).finally(() => setLoading(false))

    // Load saved customer data
    try {
      const customer = JSON.parse(localStorage.getItem('sync_webshop_customer') || 'null')
      const profile = customer?.customer || customer?.profile || customer
      if (profile) {
        setName(profile.name || profile.full_name || '')
        setEmail(profile.email || '')
        setPhone(profile.phone || profile.mobile_no || '')
        setSecondPhone(profile.second_phone || '')
        setAddress(profile.address || '')
        setGovernorate(profile.governorate || '')
        setCity(profile.city || '')
        setLocation(profile.location || '')
      }
    } catch (e) {}
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
      const data = await validateCoupon({ coupon_code: code, amount: total })
      if (data.valid) {
        setCoupon(data)
        setCouponMessage({ type: 'success', text: lang === 'ar' ? 'تم تطبيق الكود بنجاح' : 'Coupon applied successfully' })
      } else {
        setCouponMessage({ type: 'error', text: data.message || (lang === 'ar' ? 'كود غير صالح' : 'Invalid coupon code') })
      }
    } catch (err) {
      setCouponMessage({ type: 'error', text: err.message })
    } finally {
      setCouponLoading(false)
    }
  }

  async function handleConfirmOrder(stripePaymentIntent = null) {
    if (submitting) return
    if (!name || !email || !phone || (requireTerritory && (!governorate || !city)) || !address) {
      setError(lang === 'ar' ? 'يرجى إكمال جميع الحقول المطلوبة' : 'Please complete all required fields')
      window.scrollTo(0, 0)
      return
    }
    if (!emailIsValid || !phoneIsValid || !secondPhoneIsValid) {
      setError(lang === 'ar' ? 'يرجى التأكد من صحة البيانات المدخلة' : 'Please ensure all entered data is valid')
      window.scrollTo(0, 0)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Save customer info for next time
      localStorage.setItem('sync_webshop_customer', JSON.stringify(customerPayload()))

      const orderData = {
        customer: customerPayload(),
        items: items.map(i => ({ item_code: i.item_code, qty: i.qty })),
        payment_method: paymentMethod,
        stripe_payment_intent: stripePaymentIntent,
        delivery_date: deliveryDate,
        fulfillment_method: fulfillmentMethod,
        pickup_warehouse: pickupWarehouse,
        submit: true
      }

      // Always create the ERPNext Sales Order first. Paymob then receives the
      // server-calculated order total and a stable order reference.
      const response = await createOrder(orderData)

      if (paymentMethod === 'paymob') {
        const paymobResp = await createPaymobIntention({
          salesOrder: response.sales_order,
          paymentMethod: paymobMethod,
          customer: customerPayload()
        })
        if (!paymobResp.redirect_url) {
          throw new Error(lang === 'ar' ? 'تعذر بدء عملية الدفع الإلكتروني.' : 'Unable to start the online payment.')
        }
        window.location.assign(paymobResp.redirect_url)
        return
      }

      cart.clear()
      navigate(`/order-success/${response.sales_order}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) return <div className="checkout-loading-screen"><div className="loader"></div></div>
  if (settingsError) return <div className="checkout-error-screen"><p>{settingsError}</p><button onClick={() => window.location.reload()}>{lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}</button></div>

  return (
    <div className={"checkout-page " + (lang === 'ar' ? 'rtl' : 'ltr')}>
      <div className="checkout-container">
        <div className="checkout-form-container">
          <h1 className="checkout-title">{lang === 'ar' ? 'إتمام الطلب' : 'Checkout'}</h1>
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); if (paymentMethod !== 'stripe') handleConfirmOrder() }}>
            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'معلومات الشحن' : 'Shipping Information'}</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{lang === 'ar' ? 'رقم الهاتف الأساسي' : 'Primary Phone'}</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{lang === 'ar' ? 'رقم هاتف ثانٍ *' : 'Second Phone Number *'}</label>
                  <input type="text" value={secondPhone} onChange={(e) => setSecondPhone(e.target.value)} required={requireSecondPhone} />
                </div>
                {requireTerritory && (
                  <>
                    <div className="form-group">
                      <label>{lang === 'ar' ? 'المحافظة *' : 'Governorate *'}</label>
                      <select value={governorate} onChange={(e) => { setGovernorate(e.target.value); setCity('') }} required>
                        <option value="">{lang === 'ar' ? 'اختر المحافظة' : 'Select governorate'}</option>
                        {territories.map(t => <option key={t.governorate} value={t.governorate}>{t.governorate}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{lang === 'ar' ? 'المدينة *' : 'City *'}</label>
                      <select value={city} onChange={(e) => setCity(e.target.value)} required disabled={!governorate}>
                        <option value="">{lang === 'ar' ? 'اختر المدينة' : 'Select city'}</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div className="form-group full-width">
                  <label>{lang === 'ar' ? 'العنوان بالتفصيل' : 'Detailed Address'}</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} required></textarea>
                </div>
                <div className="form-group full-width">
                  <label>{lang === 'ar' ? 'موقع اختياري' : 'Optional Location'}</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={lang === 'ar' ? 'رابط الخريطة أو علامة مميزة' : 'Map link or nearby landmark'} />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'كود الخصم' : 'Coupon Code'}</h2>
              <div className="coupon-input-group">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder={lang === 'ar' ? settings.coupon_placeholder_ar : settings.coupon_placeholder_en} disabled={!!coupon} />
                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !!coupon}>{couponLoading ? '...' : (lang === 'ar' ? 'تطبيق' : 'Apply')}</button>
              </div>
              {couponMessage && <p className={"coupon-message " + couponMessage.type}>{couponMessage.text}</p>}
            </section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'اجعلها هدية' : 'Make it a gift'}</h2>
              <label className="checkbox-label">
                <input type="checkbox" checked={giftOptions.wrap} onChange={(e) => setGiftOptions({ ...giftOptions, wrap: e.target.checked })} />
                <span>{lang === 'ar' ? 'إضافة تغليف هدايا' : 'Add gift wrapping'}</span>
              </label>
              {giftOptions.wrap && (
                <textarea className="gift-note" value={giftOptions.message} onChange={(e) => setGiftOptions({ ...giftOptions, message: e.target.value })} placeholder={lang === 'ar' ? 'أضف ملاحظة شخصية' : 'Add a personal note'}></textarea>
              )}
            </section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'التنفيذ' : 'Fulfillment'}</h2>
              <div className="fulfillment-options">
                <label className={"fulfillment-option " + (fulfillmentMethod === 'Delivery' ? 'active' : '')}>
                  <input type="radio" name="fulfillment" value="Delivery" checked={fulfillmentMethod === 'Delivery'} onChange={(e) => setFulfillmentMethod(e.target.value)} />
                  <span>{lang === 'ar' ? 'توصيل' : 'Delivery'}</span>
                </label>
                {fulfillment.pickup_enabled && (
                  <label className={"fulfillment-option " + (fulfillmentMethod === 'Store Pickup' ? 'active' : '')}>
                    <input type="radio" name="fulfillment" value="Store Pickup" checked={fulfillmentMethod === 'Store Pickup'} onChange={(e) => setFulfillmentMethod(e.target.value)} />
                    <span>{lang === 'ar' ? fulfillment.pickup_title_ar : fulfillment.pickup_title_en}</span>
                  </label>
                )}
              </div>
              {fulfillmentMethod === 'Store Pickup' && (
                <div className="pickup-details">
                  <p className="form-hint">{lang === 'ar' ? fulfillment.pickup_note_ar : fulfillment.pickup_note_en}</p>
                  <select value={pickupWarehouse} onChange={(e) => setPickupWarehouse(e.target.value)} required>
                    <option value="">{lang === 'ar' ? 'اختر المستودع' : 'Select warehouse'}</option>
                    {fulfillment.warehouses?.map(w => <option key={w.name} value={w.name}>{w.label}</option>)}
                  </select>
                </div>
              )}
            </section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'تاريخ التوصيل' : 'Delivery Date'}</h2>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
              <p className="form-hint">{lang === 'ar' ? 'اختر موعد التوصيل المفضل لديك' : 'Select your preferred delivery date'}</p>
            </section>

            <section className="checkout-section">
              <h2 className="section-title-small">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h2>
              <div className="payment-methods">
                {gatewayList.map((gateway) => (
                  <div key={gateway.name} className="payment-gateway-container">
                    <label className={"payment-method-option " + (paymentMethod === gateway.name ? 'active' : '')}>
                      <input type="radio" name="paymentMethod" value={gateway.name} checked={paymentMethod === gateway.name} onChange={(event) => setPaymentMethod(event.target.value)} />
                      <span>{lang === 'ar' ? (gateway.label_ar || gateway.label) : (gateway.label_en || gateway.label)}</span>
                    </label>
                    {gateway.name === 'paymob' && paymentMethod === 'paymob' && gateway.methods && (
                      <div className="paymob-methods-grid">
                        {gateway.methods.map((m) => (
                          <label key={m.name} className={"paymob-method-card " + (paymobMethod === m.name ? 'active' : '')}>
                            <input type="radio" name="paymobMethod" value={m.name} checked={paymobMethod === m.name} onChange={() => setPaymobMethod(m.name)} />
                            <div className="paymob-method-content">
                              {m.icon && <img src={m.icon} alt={m.name} className="paymob-method-icon" />}
                              <span className="paymob-method-label">{lang === 'ar' ? m.label_ar : m.label_en}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {paymentMethod === 'paymob' && paymobGateway && (
                <p className="form-hint">
                  {lang === 'ar' ? (paymobGateway.note_ar || 'ادفع بأمان عبر Paymob') : (paymobGateway.note_en || 'Pay securely through Paymob')}
                </p>
              )}

              {paymentMethod === 'stripe' && stripePromise && (
                <div className="stripe-payment-box">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm customer={{ name, email, phone }} amount={grandTotal} currency={currency} onPaymentSuccess={(id) => handleConfirmOrder(id)} />
                  </Elements>
                </div>
              )}
            </section>

            {(paymentMethod === 'cod' || paymentMethod === 'paymob') && (
              <button type="submit" className="place-order-btn" disabled={submitting}>
                {submitting ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (paymentMethod !== 'cod' ? (lang === 'ar' ? 'المتابعة إلى الدفع' : 'Continue to Payment') : (lang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'))}
              </button>
            )}
          </form>
        </div>

        <div className="checkout-summary-container">
          <h2 className="section-title-small">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
          <div className="checkout-items">
            {items.map((item) => (
              <div key={item.item_code} className="checkout-item">
                <div className="item-img-mini">
                  {item.image && <img src={item.image} alt="" />}
                  <span className="item-qty-badge">{item.qty}</span>
                </div>
                <div className="item-name-mini">{item.item_name}</div>
                <div className="item-price-mini">{formatStorefrontPrice(item.price * item.qty, item.currency, content)}</div>
              </div>
            ))}
          </div>
          <div className="summary-footer">
            <div className="summary-row">
              <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{formatStorefrontPrice(total, currency, content)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span>
                <span>-{formatStorefrontPrice(discount, currency, content)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>{lang === 'ar' ? 'الشحن' : 'Shipping'}</span>
              <span>{shippingCost > 0 ? formatStorefrontPrice(shippingCost, currency, content) : (lang === 'ar' ? 'مجاني' : 'Free')}</span>
            </div>
            <div className="summary-row total-row">
              <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span className="total-price">{formatStorefrontPrice(grandTotal, currency, content)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
