import { useState } from 'react'
import { requestQuote } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './QuoteRequestModal.css'

export default function QuoteRequestModal({ item, content }) {
  const { lang, isRtl } = useLanguage()
  const { content: globalContent } = useContent()
  const featureCopy = globalContent?.copy?.feature || {}
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', note: '' })
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const isArabic = lang === 'ar'
  const t = (key, en, ar) => isArabic ? (featureCopy[`${key}_ar`] || ar || en) : (featureCopy[`${key}_en`] || en || ar)
  const enabled = content?.experience_settings?.quote_requests_enabled !== 0 && item?.quote_enabled
  if (!enabled) return null
  async function submit(event) {
    event.preventDefault(); setSaving(true); setStatus(null)
    try {
      const result = await requestQuote({ customer: form, company: form.company, note: form.note, items: [{ item_code: item.item_code, qty: Math.max(Number(item.quote_min_qty || content.experience_settings.quote_request_threshold || 1), 1), rate: item.price }] })
      setStatus(`${t('quote_status_prefix', 'Quote request', 'طلب عرض السعر')} ${result.name}`); setOpen(false)
    } catch (error) { setStatus(error.message) } finally { setSaving(false) }
  }
  const title = isArabic ? (content.experience_settings.quote_request_title_ar || t('quote_status_prefix', 'Request a tailored quote', 'اطلب عرض سعر مخصص')) : (content.experience_settings.quote_request_title_en || t('quote_status_prefix', 'Request a tailored quote', 'اطلب عرض سعر مخصص'))
  return <><button type="button" className="quote-request-button" onClick={() => setOpen(true)}>{title}</button>{status && <p className="quote-request-status" role="status">{status}</p>}{open && <div className="quote-modal-backdrop" role="presentation" onClick={() => setOpen(false)}><div className={`quote-modal ${isRtl ? 'rtl' : 'ltr'}`} role="dialog" aria-modal="true" aria-labelledby="quote-title" onClick={(event) => event.stopPropagation()}><button type="button" className="quote-modal-close" onClick={() => setOpen(false)} aria-label={t('close', 'Close', 'إغلاق')}>×</button><span className="section-kicker">{t('quote_kicker', 'Concierge service', 'خدمة مخصصة')}</span><h2 id="quote-title">{title}</h2><p>{t('quote_body', item.quote_note_en || 'Tell us what you need and our team will prepare a considered proposal.', item.quote_note_ar || 'أخبرنا بما تحتاجه وسنعد لك عرضاً مناسباً.')}</p><form onSubmit={submit} className="quote-form">{[['name','quote_name','text'],['email','quote_email','email'],['phone','quote_phone','tel'],['company','quote_company','text']].map(([key, copyKey, type]) => <label key={key}>{t(copyKey, key === 'name' ? 'Name' : key === 'email' ? 'Email' : key === 'phone' ? 'Phone' : 'Company or project', key === 'name' ? 'الاسم' : key === 'email' ? 'البريد الإلكتروني' : key === 'phone' ? 'الهاتف' : 'الشركة أو المشروع')}<input required={key === 'name' || key === 'email'} type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<label>{t('quote_notes', 'Notes', 'ملاحظات')}<textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label><button type="submit" className="primary-button" disabled={saving}>{saving ? t('quote_sending', 'Sending...', 'جارٍ الإرسال...') : t('quote_send', 'Send request', 'إرسال الطلب')}</button></form></div></div>}</>
}
