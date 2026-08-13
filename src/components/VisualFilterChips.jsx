import { useLanguage } from '../context/LanguageContext'
import './VisualFilterChips.css'

const CHIP_SWATCHES = ['#d7b77a', '#9ab8a3', '#cadce0', '#d2aaa4', '#b7a7c6', '#d8d0bb']

export default function VisualFilterChips({ availableAttributes = {}, selectedAttrs = {}, onToggle }) {
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const entries = Object.entries(availableAttributes || {})
  if (!entries.length) return null
  const t = (en, ar) => isArabic ? ar : en
  return (
    <section className={`visual-filter-chips ${isRtl ? 'rtl' : 'ltr'}`} aria-label={t('Visual filters', 'الفلاتر المرئية')}>
      <div className="visual-filter-heading"><span>{t('Refine by feel', 'تصفّح حسب الإحساس')}</span><small>{t('Choose a detail to shape the edit.', 'اختر تفصيلاً لتشكيل اختياراتك.')}</small></div>
      <div className="visual-filter-rail">
        {entries.flatMap(([attribute, values]) => values.slice(0, 10).map((value, index) => {
          const active = selectedAttrs[attribute]?.includes(value)
          return <button key={`${attribute}-${value}`} type="button" className={`visual-filter-chip ${active ? 'active' : ''}`} onClick={() => onToggle(attribute, value)} aria-pressed={active}>
            <span className="visual-chip-swatch" style={{ background: CHIP_SWATCHES[index % CHIP_SWATCHES.length] }} />
            <span><small>{attribute}</small><strong>{value}</strong></span><i>{active ? '✓' : '+'}</i>
          </button>
        }))}
      </div>
    </section>
  )
}
