import { useMemo, useState } from 'react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './MaterialStudio.css'

export default function MaterialStudio({ item, settings = {} }) {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const variants = useMemo(() => (Array.isArray(item?.material_variants) ? item.material_variants : []).filter((variant) => variant?.name), [item?.material_variants])
  const [activeIndex, setActiveIndex] = useState(0)
  const enabled = content?.experience_settings?.presence_material_studio_enabled !== 0 && settings.material_studio_enabled !== 0
  if (!enabled || variants.length === 0) return null
  const active = variants[Math.min(activeIndex, variants.length - 1)]
  const isArabic = lang === 'ar'
  const title = isArabic ? (content?.experience_settings?.presence_material_studio_title_ar || 'صممه بطريقتك') : (content?.experience_settings?.presence_material_studio_title_en || 'Make it yours')
  return <section className={`material-studio ${isRtl ? 'rtl' : 'ltr'}`} aria-label={title}>
    <div className="material-studio-heading"><div><span className="section-kicker">{isArabic ? 'استوديو المواد' : 'Material studio'}</span><h2>{title}</h2></div><span className="material-studio-active">{isArabic ? (active.name_ar || active.name) : active.name}</span></div>
    <div className="material-studio-preview">{active.image_url ? <img src={active.image_url} alt={isArabic ? (active.name_ar || active.name) : active.name} loading="lazy" /> : <div className="material-studio-swatch-large" style={{ background: active.swatch_color || 'linear-gradient(135deg,#d8c4a0,#6e5540)' }} aria-hidden="true" />}<div className="material-studio-overlay"><strong>{isArabic ? (active.name_ar || active.name) : active.name}</strong>{active.model_url && <a href={active.model_url} target="_blank" rel="noreferrer">{isArabic ? 'فتح نموذج ثلاثي الأبعاد' : 'Open 3D model'} ↗</a>}</div></div>
    <div className="material-studio-swatches" role="list">{variants.map((variant, index) => <button type="button" role="listitem" key={`${variant.name}-${index}`} className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} aria-label={isArabic ? (variant.name_ar || variant.name) : variant.name} aria-pressed={index === activeIndex}>{variant.image_url ? <img src={variant.image_url} alt="" /> : <span style={{ background: variant.swatch_color || '#d7c8ad' }} />}</button>)}</div>
  </section>
}
