import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './GiftOptions.css'

export default function GiftOptions({ value, onChange }) {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const exp = content?.experience_settings || {}
  if (exp.gifting_enabled === 0) return null
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => isArabic ? (ar || en || fallback) : (en || ar || fallback)
  return <section className={`gift-options checkout-section ${isRtl ? 'rtl' : 'ltr'}`}>
    <h2 className="section-title-small">{t(exp.gifting_title_en, exp.gifting_title_ar, 'Make it a gift')}</h2>
    <label className="gift-wrap-toggle"><input type="checkbox" checked={Boolean(value?.wrap)} onChange={(event) => onChange({ ...value, wrap: event.target.checked })} /><span>{t(exp.gifting_wrap_label_en, exp.gifting_wrap_label_ar, 'Add gift wrapping')}</span></label>
    <textarea rows="2" value={value?.message || ''} onChange={(event) => onChange({ ...value, message: event.target.value })} placeholder={t(exp.gifting_message_placeholder_en, exp.gifting_message_placeholder_ar, 'Add a personal note')} aria-label={t(exp.gifting_message_placeholder_en, exp.gifting_message_placeholder_ar, 'Gift message')} />
  </section>
}
