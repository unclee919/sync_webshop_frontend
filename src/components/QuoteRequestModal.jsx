import { useState } from 'react'
import { requestQuote } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import './QuoteRequestModal.css'

export default function QuoteRequestModal({ item, content }) {
  const { lang, isRtl } = useLanguage()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', note: '' })
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const isArabic = lang === 'ar'
  const enabled = content?.experience_settings?.quote_requests_enabled !== 0 && item?.quote_enabled
  if (!enabled) return null
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  async function submit(event) {
    event.preventDefault(); setSaving(true); setStatus(null)
    try { const result = await requestQuote({ customer: form, company: form.company, note: form.note, items: [{ item_code: item.item_code, qty: Math.max(Number(item.quote_min_qty || content.experience_settings.quote_request_threshold || 1), 1), rate: item.price }] }); setStatus(`${t('Quote request', 'طلب عرض السعر')} ${result.name}`); setOpen(false) } catch (error) { setStatus(error.message) } finally { setSaving(false) }
  }
  return <><button type="button" className="quote-request-button" onClick={() => setOpen(true)}>{t(content.experience_settings.quote_request_title_en || 'Request a tailored quote', content.experience_settings.quote_request_title_ar || 'اطلب عرض سعر مخصص')}</button>{status && <p className="quote-request-status" role="status">{status}</p>}{open && <div className="quote-modal-backdrop" role="presentation" onClick={() => setOpen(false)}><div className={`quote-modal ${isRtl ? 'rtl' : 'ltr'}`} role="dialog" aria-modal="true" aria-labelledby="quote-title" onClick={(event) => event.stopPropagation()}><button type="button" className="quote-modal-close" onClick={() => setOpen(false)} aria-label={t('Close', 'إغلاق')}>×</button><span className="section-kicker">{t('Concierge service', 'خدمة مخصصة')}</span><h2 id="quote-title">{t(content.experience_settings.quote_request_title_en || 'Request a tailored quote', content.experience_settings.quote_request_title_ar || 'اطلب عرض سعر مخصص')}</h2><p>{t(item.quote_note_en || 'Tell us what you need and our team will prepare a considered proposal.', item.quote_note_ar || 'أخبرنا بما تحتاجه وسنعد لك عرضاً مناسباً.')}</p><form onSubmit={submit} className="quote-form">{[['name','Name','الاسم','text'],['email','Email','البريد الإلكتروني','email'],['phone','Phone','الهاتف','tel'],['company','Company or project','الشركة أو المشروع','text']].map(([key,en,ar,type]) => <label key={key}>{t(en,ar)}<input required={key === 'name' || key === 'email'} type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}<label>{t('Notes','ملاحظات')}<textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label><button type="submit" className="primary-button" disabled={saving}>{saving ? t('Sending…','جارٍ الإرسال…') : t('Send request','إرسال الطلب')}</button></form></div></div>}</>
}
