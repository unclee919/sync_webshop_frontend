import { useState } from 'react'
import { getCustomerPortal, getInvoice, requestReturn } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import './Cart.css'
import './Dashboard.css'

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
  const text = {
    title: isArabic ? 'حسابي' : 'My account',
    subtitle: isArabic ? 'تابع طلباتك وفواتيرك وطلبات الإرجاع من مكان واحد.' : 'Track orders, invoices, delivery updates, and return requests in one place.',
    emailPlaceholder: isArabic ? 'أدخل البريد الإلكتروني المستخدم عند الدفع' : 'Enter the email used at checkout',
    lookup: isArabic ? 'عرض طلباتي' : 'View my orders',
    loading: isArabic ? 'جارٍ البحث...' : 'Looking up...',
    noOrders: isArabic ? 'لا توجد طلبات لهذا البريد الإلكتروني.' : 'No orders found for that email.',
    orders: isArabic ? 'الطلبات' : 'Orders',
    invoices: isArabic ? 'الفواتير' : 'Invoices',
    returns: isArabic ? 'طلبات الإرجاع' : 'Return requests',
    download: isArabic ? 'تحميل PDF' : 'Download PDF',
    delivery: isArabic ? 'التسليم' : 'Delivery',
    requestReturn: isArabic ? 'طلب إرجاع' : 'Request return',
    close: isArabic ? 'إلغاء' : 'Cancel',
    submit: isArabic ? 'إرسال الطلب' : 'Submit request',
    reason: isArabic ? 'سبب الإرجاع' : 'Reason for return',
    quantity: isArabic ? 'الكمية' : 'Quantity',
    success: isArabic ? 'تم إرسال طلب الإرجاع.' : 'Return request submitted successfully.',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)
    try { setResult(await getCustomerPortal({ email: email.trim() })) } catch (err) { setError(err.message) } finally { setLoading(false) }
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
      setResult(await getCustomerPortal({ email: email.trim() }))
    } catch (err) { setError(err.message) } finally { setReturning(false) }
  }

  return (
    <div className={`dashboard-page ${isRtl ? 'rtl' : 'ltr'}`}>
      <header className="dashboard-header"><h1 className="page-title">{text.title}</h1><p>{text.subtitle}</p></header>
      <form className="dashboard-lookup" onSubmit={handleSubmit}><input type="email" required placeholder={text.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} /><button type="submit" disabled={loading}>{loading ? text.loading : text.lookup}</button></form>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {notice && <p className="dashboard-notice" role="status">{notice}</p>}
      {result && <>
        <div className="portal-summary"><div><strong>{result.orders?.length || 0}</strong><span>{text.orders}</span></div><div><strong>{result.invoices?.length || 0}</strong><span>{text.invoices}</span></div><div><strong>{result.returns?.length || 0}</strong><span>{text.returns}</span></div></div>
        {result.orders?.length === 0 && <p className="dashboard-empty">{text.noOrders}</p>}
        <section className="portal-section"><h2>{text.orders}</h2>{result.orders?.map((order) => <article className="order-card" key={order.name}><div className="order-card-top"><span className="order-card-name">{order.name}</span><span className="order-status-pill">{order.status}</span></div><p className="order-card-date">{order.transaction_date}{order.delivery_date ? ` · ${text.delivery}: ${order.delivery_date}` : ''}</p><p className="order-card-items" dir="auto">{order.items?.map((item) => <span className="order-line" key={`${order.name}-${item.item_code}`}>{item.item_name} × {item.qty}<button type="button" className="inline-action" onClick={() => setReturnForm({ orderName: order.name, itemCode: item.item_code, itemName: item.item_name, qty: 1, reason: '' })}>{text.requestReturn}</button></span>)}</p>{order.delivery_notes?.length > 0 && <p className="delivery-note">{order.delivery_notes.map((note) => `${note.name}${note.tracking_number ? ` · ${note.tracking_number}` : ''}`).join(' · ')}</p>}<p className="order-card-total">{Number(order.grand_total || 0).toFixed(2)} {order.currency}</p></article>)}</section>
        <section className="portal-section"><h2>{text.invoices}</h2>{result.invoices?.length ? result.invoices.map((invoice) => <div className="portal-row" key={invoice.name}><div><strong>{invoice.name}</strong><span>{invoice.posting_date} · {invoice.status}</span></div><strong>{Number(invoice.grand_total || 0).toFixed(2)} {invoice.currency}</strong><button type="button" onClick={() => handleInvoice(invoice)} disabled={invoiceLoading === invoice.name}>{invoiceLoading === invoice.name ? '...' : text.download}</button></div>) : <p className="dashboard-empty">{isArabic ? 'لا توجد فواتير.' : 'No invoices available.'}</p>}</section>
        <section className="portal-section"><h2>{text.returns}</h2>{result.returns?.length ? result.returns.map((rma) => <div className="portal-row" key={rma.name}><div><strong>{rma.subject}</strong><span>{rma.opening_date}</span></div><span className="order-status-pill">{rma.status}</span></div>) : <p className="dashboard-empty">{isArabic ? 'لا توجد طلبات إرجاع.' : 'No return requests yet.'}</p>}</section>
      </>}
      {returnForm && <div className="return-modal-backdrop" role="presentation"><form className="return-modal" onSubmit={handleReturnSubmit}><h2>{text.requestReturn}</h2><p>{returnForm.itemName}</p><label>{text.quantity}<input type="number" min="1" max={returnForm.qty || 1} value={returnForm.qty} onChange={(e) => setReturnForm({ ...returnForm, qty: Math.max(1, Number(e.target.value) || 1) })} /></label><label>{text.reason}<textarea required value={returnForm.reason} onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })} /></label><div className="return-modal-actions"><button type="button" onClick={() => setReturnForm(null)}>{text.close}</button><button type="submit" disabled={returning}>{returning ? text.loading : text.submit}</button></div></form></div>}
    </div>
  )
}
