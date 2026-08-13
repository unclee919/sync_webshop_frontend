import { useState } from 'react'
import { deleteCustomerAddress, getCustomerPortal, getInvoice, getItem, requestReturn, saveCustomerAddress, updateCustomerProfile } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import './Cart.css'
import './Dashboard.css'

function TrackingTimeline({ timeline, isArabic }) {
  if (!timeline || timeline.length === 0) return null
  return (
    <div className="elite-tracking-container">
      <div className="tracking-timeline-elite">
        {timeline.map((step, index) => {
          const isLast = index === timeline.length - 1
          const isActive = step.complete
          const isCurrent = step.complete && (!timeline[index + 1] || !timeline[index + 1].complete)
          return (
            <div className={`elite-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`} key={step.key}>
              <div className="elite-step-visual">
                <div className="elite-step-dot">
                  {isCurrent && <div className="elite-dot-pulse" />}
                </div>
                {!isLast && <div className="elite-step-line" />}
              </div>
              <div className="elite-step-label">{isArabic ? step.label_ar : step.label_en}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(null)
  const [returning, setReturning] = useState(false)
  const [returnForm, setReturnForm] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profile, setProfile] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [addressForm, setAddressForm] = useState(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const [reordering, setReordering] = useState(null)
  const { addItem } = useCart()
  const navigate = useNavigate()
  
  const text = {
    title: isArabic ? 'حسابي' : 'My account',
    subtitle: isArabic ? 'تابع طلباتك وفواتيرك ونقاطك وطلبات الإرجاع من مكان واحد.' : 'Track orders, invoices, loyalty points, profile details, and returns in one place.',
    emailPlaceholder: isArabic ? 'أدخل البريد الإلكتروني المستخدم عند الدفع' : 'Enter the email used at checkout',
    lookup: isArabic ? 'عرض لوحة حسابي' : 'Open my dashboard',
    loading: isArabic ? 'جارٍ التحميل...' : 'Loading...',
    noOrders: isArabic ? 'لا توجد طلبات لهذا البريد الإلكتروني.' : 'No orders found for that email.',
    orders: isArabic ? 'الطلبات' : 'Orders',
    invoices: isArabic ? 'الفواتير' : 'Invoices',
    returns: isArabic ? 'طلبات الإرجاع' : 'Return requests',
    analytics: isArabic ? 'ملخص الحساب' : 'Account summary',
    loyalty: isArabic ? 'نقاط الولاء' : 'Loyalty points',
    profile: isArabic ? 'بياناتي' : 'My profile',
    save: isArabic ? 'حفظ التغييرات' : 'Save changes',
    edit: isArabic ? 'تعديل البيانات' : 'Edit profile',
    download: isArabic ? 'تحميل PDF' : 'Download PDF',
    delivery: isArabic ? 'التسليم' : 'Delivery',
    requestReturn: isArabic ? 'طلب إرجاع' : 'Request return',
    close: isArabic ? 'إلغاء' : 'Cancel',
    submit: isArabic ? 'إرسال الطلب' : 'Submit request',
    reason: isArabic ? 'سبب الإرجاع' : 'Reason for return',
    quantity: isArabic ? 'الكمية' : 'Quantity',
    success: isArabic ? 'تم إرسال طلب الإرجاع.' : 'Return request submitted successfully.',
    profileSaved: isArabic ? 'تم تحديث البيانات.' : 'Profile updated successfully.',
    addressSaved: isArabic ? 'تم حفظ العنوان.' : 'Address saved successfully.',
    addressDeleted: isArabic ? 'تم حذف العنوان.' : 'Address deleted successfully.',
    spend: isArabic ? 'إجمالي الإنفاق' : 'Total spend',
    average: isArabic ? 'متوسط الطلب' : 'Average order',
    completed: isArabic ? 'طلبات مكتملة' : 'Completed orders',
    addresses: isArabic ? 'عناويني' : 'Saved addresses',
    addAddress: isArabic ? 'إضافة عنوان' : 'Add address',
    editAddress: isArabic ? 'تعديل العنوان' : 'Edit address',
    deleteAddress: isArabic ? 'حذف' : 'Delete',
    addressDeleteConfirm: isArabic ? 'هل تريد حذف هذا العنوان؟' : 'Delete this address?',
    addressLine: isArabic ? 'العنوان' : 'Address line',
    city: isArabic ? 'المدينة' : 'City',
    country: isArabic ? 'الدولة' : 'Country',
    reorder: isArabic ? 'إعادة الطلب' : 'Reorder',
  }

  async function refreshPortal() {
    const data = await getCustomerPortal({ email: email.trim() })
    setResult(data)
    setProfile(data.profile || null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)
    try { await refreshPortal() } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function handleInvoice(invoice) {
    setInvoiceLoading(invoice.name)
    setError(null)
    try {
      const verifiedInvoice = await getInvoice(invoice.name, { email: email.trim() })
      const url = new URL(verifiedInvoice.pdf_url, import.meta.env.VITE_API_BASE_URL || window.location.origin).toString()
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) { setError(err.message) } finally { setInvoiceLoading(null) }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()
    if (!profile) return
    setSavingProfile(true)
    setError(null)
    setNotice(null)
    try {
      const response = await updateCustomerProfile({ profile, email: email.trim() })
      setProfile(response.profile)
      setResult({ ...result, profile: response.profile })
      setEditingProfile(false)
      setNotice(text.profileSaved)
    } catch (err) { setError(err.message) } finally { setSavingProfile(false) }
  }

  async function handleAddressSubmit(e) {
    e.preventDefault()
    if (!addressForm) return
    setSavingAddress(true)
    setError(null)
    setNotice(null)
    try {
      const response = await saveCustomerAddress({ address: addressForm, addressName: addressForm.name, email: email.trim() })
      setResult({ ...result, addresses: response.addresses || [] })
      setAddressForm(null)
      setNotice(text.addressSaved)
    } catch (err) { setError(err.message) } finally { setSavingAddress(false) }
  }

  async function handleAddressDelete(addressName) {
    if (!window.confirm(text.addressDeleteConfirm)) return
    setError(null)
    try {
      const response = await deleteCustomerAddress({ addressName, email: email.trim() })
      setResult({ ...result, addresses: response.addresses || [] })
      setNotice(text.addressDeleted)
    } catch (err) { setError(err.message) }
  }

  async function handleReorder(itemCode) {
    if (!itemCode) return
    setReordering(itemCode)
    setError(null)
    try {
      const item = await getItem(itemCode)
      addItem({ item_code: item.item_code, item_name: item.item_name, price: item.price, currency: item.currency, image: item.image }, 1)
      setNotice(isArabic ? 'تمت إضافة المنتج إلى السلة.' : 'Item added to your bag.')
      navigate('/cart')
    } catch (err) { setError(err.message) } finally { setReordering(null) }
  }

  async function handleReturnSubmit(e) {
    e.preventDefault()
    if (!returnForm) return
    setReturning(true)
    setError(null)
    setNotice(null)
    try {
      await requestReturn({ orderName: returnForm.orderName, itemCode: returnForm.itemCode, qty: returnForm.qty, reason: returnForm.reason, email: email.trim() })
      setNotice(text.success)
      setReturnForm(null)
      await refreshPortal()
    } catch (err) { setError(err.message) } finally { setReturning(false) }
  }

  const settings = result?.settings || {}
  const analytics = result?.analytics
  return (
    <div className={`dashboard-page ${isRtl ? 'rtl' : 'ltr'}`}>
      <header className="dashboard-header"><h1 className="page-title">{text.title}</h1><p>{text.subtitle}</p></header>
      <form className="dashboard-lookup" onSubmit={handleSubmit}><input type="email" required placeholder={text.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} /><button type="submit" disabled={loading}>{loading ? text.loading : text.lookup}</button></form>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {notice && <p className="dashboard-notice" role="status">{notice}</p>}
      {result && <>
        {analytics && <section className="portal-section"><h2>{text.analytics}</h2><div className="portal-summary"><div><strong>{analytics.total_orders || 0}</strong><span>{text.orders}</span></div><div><strong>{Number(analytics.total_spend || 0).toFixed(2)} {analytics.currency || ''}</strong><span>{text.spend}</span></div><div><strong>{Number(analytics.average_order_value || 0).toFixed(2)} {analytics.currency || ''}</strong><span>{text.average}</span></div><div><strong>{analytics.completed_orders || 0}</strong><span>{text.completed}</span></div></div></section>}
        {result.loyalty && settings.enable_loyalty && <section className="portal-section loyalty-card"><h2>{text.loyalty}</h2><strong>{Number(result.loyalty.points || 0).toLocaleString()} </strong><span>{text.loyalty}</span></section>}
        {result.membership && settings.enable_loyalty && <section className="portal-section loyalty-card membership-card"><h2>{isArabic ? (settings.membership_title_ar || 'عضويتك') : (settings.membership_title_en || 'Your membership')}</h2><strong style={{ color: result.membership.badge_color || '#C8A96B' }}>{result.membership.tier_name || (isArabic ? 'عضو جديد' : 'New member')}</strong>{result.membership.discount_percent > 0 && <span>{Number(result.membership.discount_percent).toFixed(0)}% {isArabic ? 'خصم للأعضاء' : 'member discount'}</span>}<small>{isArabic ? (result.membership.perks_ar || '') : (result.membership.perks_en || '')}</small></section>}
        {result.profile && <section className="portal-section"><div className="portal-section-heading"><h2>{text.profile}</h2>{settings.enable_profile_edit && <button type="button" className="inline-action" onClick={() => setEditingProfile(!editingProfile)}>{text.edit}</button>}</div>{editingProfile ? <form className="profile-form" onSubmit={handleProfileSubmit}><label>{isArabic ? 'الاسم' : 'Name'}<input value={profile.customer_name || ''} onChange={(e) => setProfile({ ...profile, customer_name: e.target.value })} /></label><label>{isArabic ? 'البريد الإلكتروني' : 'Email'}<input type="email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label><label>{isArabic ? 'الهاتف' : 'Phone'}<input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label><button type="submit" disabled={savingProfile}>{savingProfile ? text.loading : text.save}</button></form> : <div className="profile-summary"><strong>{result.profile.customer_name}</strong><span>{result.profile.email}</span><span>{result.profile.phone}</span></div>}</section>}
        {settings.enable_addresses && <section className="portal-section"><div className="portal-section-heading"><h2>{text.addresses}</h2><button type="button" className="inline-action" onClick={() => setAddressForm({ address_title: result.profile?.customer_name || '', address_type: 'Shipping', address_line1: '', city: '', country: '', pincode: '', phone: result.profile?.phone || '', email_id: result.profile?.email || '' })}>{text.addAddress}</button></div>{result.addresses?.length ? <div className="address-grid">{result.addresses.map((address) => <article className="address-card" key={address.name}><strong>{address.address_title || address.name}</strong><span>{address.address_line1}</span><span>{[address.city, address.state, address.pincode].filter(Boolean).join(', ')}</span><span>{address.country}</span><div><button type="button" className="inline-action" onClick={() => setAddressForm(address)}>{text.editAddress}</button><button type="button" className="inline-action danger" onClick={() => handleAddressDelete(address.name)}>{text.deleteAddress}</button></div></article>)}</div> : <p className="dashboard-empty">{isArabic ? 'لا توجد عناوين محفوظة.' : 'No saved addresses yet.'}</p>}</section>}
        {result.orders?.length === 0 && <p className="dashboard-empty">{text.noOrders}</p>}
        <section className="portal-section"><h2>{text.orders}</h2>{result.orders?.map((order) => <article className="order-card" key={order.name}><div className="order-card-top"><span className="order-card-name">{order.name}</span><span className="order-status-pill">{order.status}</span></div><p className="order-card-date">{order.transaction_date}{order.delivery_date ? ` · ${text.delivery}: ${order.delivery_date}` : ''}</p>{settings.enable_tracking_timeline && order.tracking_timeline?.length > 0 && <TrackingTimeline timeline={order.tracking_timeline} isArabic={isArabic} />}<p className="order-card-items" dir="auto">{order.items?.map((item) => <span className="order-line" key={`${order.name}-${item.item_code}`}>{item.item_name} × {item.qty}<button type="button" className="inline-action" onClick={() => handleReorder(item.item_code)} disabled={reordering === item.item_code}>{reordering === item.item_code ? '...' : text.reorder}</button>{settings.enable_rma && <button type="button" className="inline-action" onClick={() => setReturnForm({ orderName: order.name, itemCode: item.item_code, itemName: item.item_name, qty: 1, reason: '' })}>{text.requestReturn}</button>}</span>)}</p>{order.delivery_notes?.length > 0 && <p className="delivery-note">{order.delivery_notes.map((note) => `${note.name}${note.tracking_number ? ` · ${note.tracking_number}` : ''}`).join(' · ')}</p>}<p className="order-card-total">{Number(order.grand_total || 0).toFixed(2)} {order.currency}</p></article>)}</section>
        <section className="portal-section"><h2>{text.invoices}</h2>{result.invoices?.length ? result.invoices.map((invoice) => <div className="portal-row" key={invoice.name}><div><strong>{invoice.name}</strong><span>{invoice.posting_date} · {invoice.status}</span></div><strong>{Number(invoice.grand_total || 0).toFixed(2)} {invoice.currency}</strong><button type="button" onClick={() => handleInvoice(invoice)} disabled={invoiceLoading === invoice.name}>{invoiceLoading === invoice.name ? '...' : text.download}</button></div>) : <p className="dashboard-empty">{isArabic ? 'لا توجد فواتير.' : 'No invoices available.'}</p>}</section>
        <section className="portal-section"><h2>{text.returns}</h2>{result.returns?.length ? result.returns.map((rma) => <div className="portal-row" key={rma.name}><div><strong>{rma.subject}</strong><span>{rma.opening_date}</span></div><span className="order-status-pill">{rma.status}</span></div>) : <p className="dashboard-empty">{isArabic ? 'لا توجد طلبات إرجاع.' : 'No return requests yet.'}</p>}</section>
      </>}
      {addressForm && <div className="return-modal-backdrop" role="presentation"><form className="return-modal" onSubmit={handleAddressSubmit}><h2>{addressForm.name ? text.editAddress : text.addAddress}</h2><label>{isArabic ? 'اسم العنوان' : 'Address name'}<input required value={addressForm.address_title || ''} onChange={(e) => setAddressForm({ ...addressForm, address_title: e.target.value })} /></label><label>{text.addressLine}<input required value={addressForm.address_line1 || ''} onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })} /></label><label>{text.city}<input required value={addressForm.city || ''} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></label><label>{text.country}<input required value={addressForm.country || ''} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} /></label><label>{isArabic ? 'الرمز البريدي' : 'Postcode'}<input value={addressForm.pincode || ''} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} /></label><div className="return-modal-actions"><button type="button" onClick={() => setAddressForm(null)}>{text.close}</button><button type="submit" disabled={savingAddress}>{savingAddress ? text.loading : text.save}</button></div></form></div>}
      {returnForm && <div className="return-modal-backdrop" role="presentation"><form className="return-modal" onSubmit={handleReturnSubmit}><h2>{text.requestReturn}</h2><p>{returnForm.itemName}</p><label>{text.quantity}<input type="number" min="1" max={returnForm.qty || 1} value={returnForm.qty} onChange={(e) => setReturnForm({ ...returnForm, qty: Math.max(1, Number(e.target.value) || 1) })} /></label><label>{text.reason}<textarea required value={returnForm.reason} onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })} /></label><div className="return-modal-actions"><button type="button" onClick={() => setReturnForm(null)}>{text.close}</button><button type="submit" disabled={returning}>{returning ? text.loading : text.submit}</button></div></form></div>}
    </div>
  )
}
