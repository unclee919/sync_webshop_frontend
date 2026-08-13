import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent } from '../utils/analytics'
import './ProductStageSwitcher.css'

export default function ProductStageSwitcher({ item }) {
  const { lang, isRtl } = useLanguage()
  const [active, setActive] = useState(0)
  const images = item?.stage_images || []
  if (!images.length) return null
  const isArabic = lang === 'ar'
  const labels = item.stage_labels || {}
  const fallback = isArabic ? ['المشهد الأساسي', 'مشهد آخر'] : ['Primary stage', 'Alternate stage']
  const panelId = `stage-panel-${String(item.item_code || 'product').replace(/[^a-zA-Z0-9_-]/g, '-')}`
  return <section className={`product-stage-switcher ${isRtl ? 'rtl' : 'ltr'}`} aria-label={isArabic ? 'مشاهد المنتج' : 'Product staging'}>
    <div className="stage-switcher-heading"><span>{isArabic ? (labels.ar || 'عرض المنتج') : (labels.en || 'Product staging')}</span><small>{isArabic ? 'تجربة المشهد' : 'Try a different scene'}</small></div>
    <div className="stage-switcher-viewport" id={panelId} role="tabpanel" aria-label={fallback[active] || `${isArabic ? 'مشهد' : 'Stage'} ${active + 1}`}><img src={images[active]} alt={item.item_name} loading="lazy" decoding="async" width="1000" height="1000" sizes="(max-width: 820px) 100vw, 52vw" /></div>
    {images.length > 1 && <div className="stage-switcher-tabs" role="tablist">{images.map((image, index) => <button type="button" role="tab" id={`${panelId}-tab-${index}`} aria-controls={panelId} aria-selected={active === index} tabIndex={active === index ? 0 : -1} key={image} className={active === index ? 'active' : ''} onClick={() => { setActive(index); trackEvent('product_stage_changed', { item_code: item.item_code, stage_index: index }) }}><span className="stage-tab-thumb"><img src={image} alt="" loading="lazy" decoding="async" width="48" height="48" /></span>{fallback[index] || `${isArabic ? 'مشهد' : 'Stage'} ${index + 1}`}</button>)}</div>}
  </section>
}
