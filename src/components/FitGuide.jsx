import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import { trackEvent } from '../utils/analytics'
import './FitGuide.css'

export default function FitGuide({ item, settings = {} }) {
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  const isArabic = lang === 'ar'
  const [open, setOpen] = useState(false)
  const [measurements, setMeasurements] = useState({ height: '', chest: '', waist: '' })
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  const featureCopy = content?.copy?.feature || {}
  const uiCopy = content?.copy?.ui || {}
  const recommendation = useMemo(() => {
    const chest = Number(measurements.chest)
    const waist = Number(measurements.waist)
    if (!chest && !waist) return null
    if (chest >= 108 || waist >= 96) return { size: 'XL', note: t(featureCopy.fit_guide_relaxed_note_en || 'Relaxed and generous through the body.', featureCopy.fit_guide_relaxed_note_ar || 'قصة مريحة وواسعة حول الجسم.') }
    if (chest >= 98 || waist >= 86) return { size: 'L', note: t(featureCopy.fit_guide_balanced_note_en || 'A balanced fit with room to move.', featureCopy.fit_guide_balanced_note_ar || 'قصة متوازنة تمنحك حرية الحركة.') }
    if (chest >= 88 || waist >= 76) return { size: 'M', note: t(featureCopy.fit_guide_everyday_note_en || 'The considered everyday fit.', featureCopy.fit_guide_everyday_note_ar || 'المقاس المتوازن للاستخدام اليومي.') }
    return { size: 'S', note: t(featureCopy.fit_guide_refined_note_en || 'A closer, refined silhouette.', featureCopy.fit_guide_refined_note_ar || 'قصة أقرب بصياغة راقية.') }
  }, [measurements, isArabic])
  useEffect(() => {
    if (open) trackEvent('fit_guide_open', { item_group: item?.item_group || 'unknown' })
  }, [open, item?.item_group])
  useEffect(() => {
    if (recommendation) trackEvent('fit_recommendation_viewed', { recommended_size: recommendation.size, item_group: item?.item_group || 'unknown' })
  }, [recommendation, item?.item_group])
  if (settings.fit_guide_enabled === 0) return null
  return <>
    <button type="button" className="fit-guide-trigger" onClick={() => { setOpen(true); trackEvent('fit_guide_open_intent', { item_group: item?.item_group || 'unknown' }) }} data-magnetic="true"><span>⌁</span><span><strong>{t(settings.fit_guide_title_en || 'Find your best fit', settings.fit_guide_title_ar || 'اعثر على المقاس المناسب')}</strong><small>{t(featureCopy.fit_guide_subtitle_en || 'A private, on-device guide', featureCopy.fit_guide_subtitle_ar || 'دليل خاص يعمل على جهازك')}</small></span><b>↗</b></button>
    <AnimatePresence>{open && <motion.div className="fit-guide-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}><motion.div className={`fit-guide-modal elite-glass ${isRtl ? 'rtl' : 'ltr'}`} initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} onClick={(event) => event.stopPropagation()}>
      <button type="button" className="fit-guide-close" onClick={() => setOpen(false)} aria-label={t(uiCopy.close_en || 'Close', uiCopy.close_ar || 'إغلاق')}>×</button><span className="fit-guide-kicker">{t(featureCopy.fit_guide_kicker_en || 'Fit studio', featureCopy.fit_guide_kicker_ar || 'استوديو المقاس')}</span><h2>{t(settings.fit_guide_title_en || 'Find your best fit', settings.fit_guide_title_ar || 'اعثر على المقاس المناسب')}</h2><p>{t(featureCopy.fit_guide_privacy_en || 'Enter approximate measurements. They stay in this browser and are never submitted.', featureCopy.fit_guide_privacy_ar || 'أدخل قياسات تقريبية. تبقى على هذا المتصفح ولا يتم إرسالها.')}</p>
      <div className="fit-guide-fields">{[['height',featureCopy.fit_guide_height_label_en || 'Height (cm)',featureCopy.fit_guide_height_label_ar || 'الطول (سم)'],['chest',featureCopy.fit_guide_chest_label_en || 'Chest (cm)',featureCopy.fit_guide_chest_label_ar || 'الصدر (سم)'],['waist',featureCopy.fit_guide_waist_label_en || 'Waist (cm)',featureCopy.fit_guide_waist_label_ar || 'الخصر (سم)']].map(([key,en,ar]) => <label key={key}>{t(en, ar)}<input inputMode="decimal" type="number" min="0" value={measurements[key]} onChange={(event) => setMeasurements((current) => ({ ...current, [key]: event.target.value }))} placeholder="—" /></label>)}</div>
      <div className="fit-guide-visual"><div className="fit-guide-person"><span className="head" /><span className="body" /><span className="legs" /></div><div><small>{t(featureCopy.fit_guide_recommendation_label_en || 'Your recommendation', featureCopy.fit_guide_recommendation_label_ar || 'اقتراحك')}</small><strong>{recommendation?.size || '—'}</strong><p>{recommendation?.note || t(featureCopy.fit_guide_empty_state_en || 'Add two measurements to see a suggestion.', featureCopy.fit_guide_empty_state_ar || 'أضف قياسين لرؤية الاقتراح.')}</p></div></div>
    </motion.div></motion.div>}</AnimatePresence>
  </>
}
