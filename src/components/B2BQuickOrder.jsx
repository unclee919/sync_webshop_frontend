import { useState } from 'react'
import { bulkQuickOrder } from '../api/client'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './B2BQuickOrder.css'

export default function B2BQuickOrder() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const { addItem } = useCart()
  const [rows, setRows] = useState([{ item_code: '', qty: 1 }])
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const isArabic = lang === 'ar'
  const t = (en, ar) => isArabic ? ar : en
  if (content?.enterprise_settings?.b2b?.quick_order_enabled === 0) return null
  const update = (index, key, value) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row))
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setResult(null)
    try {
      const response = await bulkQuickOrder(rows.filter((row) => row.item_code.trim()))
      setResult(response)
      response.lines?.filter((line) => line.valid).forEach((line) => addItem({ item_code: line.item_code, item_name: line.item_name, price: line.pricing.unit_price, currency: line.pricing.currency, image: line.image }, line.qty))
    } catch (error) { setResult({ error: error.message }) } finally { setBusy(false) }
  }
  return <section className={`b2b-quick-order ${isRtl ? 'rtl' : 'ltr'}`}><div className="b2b-quick-order-heading"><div><span className="section-kicker">{t('For business buyers', 'للمشترين من الشركات')}</span><h2>{t('Bulk quick order', 'طلب سريع بالجملة')}</h2><p>{t('Enter ERPNext item codes and quantities to validate volume pricing in one step.', 'أدخل رموز الأصناف والكميات للتحقق من أسعار الجملة في خطوة واحدة.')}</p></div></div><form onSubmit={submit}>{rows.map((row, index) => <div className="b2b-order-row" key={index}><input required placeholder={t('Item code', 'رمز الصنف')} value={row.item_code} onChange={(event) => update(index, 'item_code', event.target.value)} /><input required type="number" min="1" placeholder={t('Qty', 'الكمية')} value={row.qty} onChange={(event) => update(index, 'qty', event.target.value)} />{rows.length > 1 && <button type="button" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>×</button>}</div>)}<div className="b2b-quick-order-actions"><button type="button" onClick={() => setRows((current) => [...current, { item_code: '', qty: 1 }])}>{t('Add line', 'إضافة سطر')}</button><button type="submit" disabled={busy}>{busy ? t('Checking…', 'جارٍ التحقق…') : t('Validate and add to bag', 'تحقق وأضف إلى السلة')}</button></div></form>{result?.error && <p role="alert">{result.error}</p>}{result?.lines && <div className="b2b-results">{result.lines.map((line) => <div key={`${line.item_code}-${line.qty}`}><strong>{line.item_code || t('Unknown item', 'صنف غير معروف')}</strong><span>{line.valid ? `${line.qty} × ${Number(line.pricing.unit_price || 0).toFixed(2)} ${line.pricing.currency}` : line.reason}</span></div>)}</div>}</section>
}
