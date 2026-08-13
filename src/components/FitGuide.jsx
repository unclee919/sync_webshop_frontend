import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent } from '../utils/analytics'
import './FitGuide.css'

export default function FitGuide({ item, settings = {} }) {
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const [open, setOpen] = useState(false)
  const [measurements, setMeasurements] = useState({ height: '', chest: '', waist: '' })
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  const recommendation = useMemo(() => {
    const chest = Number(measurements.chest)
    const waist = Number(measurements.waist)
    if (!chest && !waist) return null
    if (chest >= 108 || waist >= 96) return { size: 'XL', note: t('Relaxed and generous through the body.', 'قصة مريحة وواسعة حول الجسم.') }
    if (chest >= 98 || waist >= 86) return { size: 'L', note: t('A balanced fit with room to move.', 'قصة متوازنة تمنحك حرية الحركة.') }
    if (chest >= 88 || waist >= 76) return { size: 'M', note: t('The considered everyday fit.', 'المقاس المتوازن للاستخدام اليومي.') }
    return { size: 'S', note: t('A closer, refined silhouette.', 'قصة أقرب بصياغة راقية.') }
  }, [measurements, isArabic])
  useEffect(() => {
    if (open) trackEvent('fit_guide_open', { item_group: item?.item_group || 'unknown' })
  }, [open, item?.item_group])
  useEffect(() => {
    if (recommendation) trackEvent('fit_recommendation_viewed', { recommended_size: recommendation.size, item_group: item?.item_group || 'unknown' })
  }, [recommendation, item?.item_group])
  if (settings.fit_guide_enabled === 0) return null
  return <>
    <button type="button" className="fit-guide-trigger" onClick={() => { setOpen(true); trackEvent('fit_guide_open_intent', { item_group: item?.item_group || 'unknown' }) }} data-magnetic="true"><span>⌁</span><span><strong>{t(settings.fit_guide_title_en || 'Find your best fit', settings.fit_guide_title_ar || 'اعثر على المقاس المناسب')}</strong><small>{t('A private, on-device guide', 'دليل خاص يعمل على جهازك')}</small></span><b>↗</b></button>
    <AnimatePresence>{open && <motion.div className="fit-guide-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}><motion.div className={`fit-guide-modal elite-glass ${isRtl ? 'rtl' : 'ltr'}`} initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} onClick={(event) => event.stopPropagation()}>
      <button type="button" className="fit-guide-close" onClick={() => setOpen(false)} aria-label={t('Close', 'إغلاق')}>×</button><span className="fit-guide-kicker">{t('Fit studio', 'استوديو المقاس')}</span><h2>{t(settings.fit_guide_title_en || 'Find your best fit', settings.fit_guide_title_ar || 'اعثر على المقاس المناسب')}</h2><p>{t('Enter approximate measurements. They stay in this browser and are never submitted.', 'أدخل قياسات تقريبية. تبقى على هذا المتصفح ولا يتم إرسالها.')}</p>
      <div className="fit-guide-fields">{[['height','Height (cm)','الطول (سم)'],['chest','Chest (cm)','الصدر (سم)'],['waist','Waist (cm)','الخصر (سم)']].map(([key,en,ar]) => <label key={key}>{t(en, ar)}<input inputMode="decimal" type="number" min="0" value={measurements[key]} onChange={(event) => setMeasurements((current) => ({ ...current, [key]: event.target.value }))} placeholder="—" /></label>)}</div>
      <div className="fit-guide-visual"><div className="fit-guide-person"><span className="head" /><span className="body" /><span className="legs" /></div><div><small>{t('Your recommendation', 'اقتراحك')}</small><strong>{recommendation?.size || '—'}</strong><p>{recommendation?.note || t('Add two measurements to see a suggestion.', 'أضف قياسين لرؤية الاقتراح.')}</p></div></div>
    </motion.div></motion.div>}</AnimatePresence>
  </>
}
