import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent } from '../utils/analytics'
import './LookbookHotspots.css'

export default function LookbookHotspots({ src, alt = '', hotspots = [], collectionSlug = '', sectionOrder = 0 }) {
  const { lang, isRtl } = useLanguage()
  const navigate = useNavigate()
  const [active, setActive] = useState(null)
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => isArabic ? (ar || en || fallback) : (en || ar || fallback)
  if (!src) return null
  const goToSpot = (spot) => {
    const target = spot.featured_item?.item_code ? `/products/${encodeURIComponent(spot.featured_item.item_code)}` : spot.link_url
    trackEvent('lookbook_hotspot_click', { collection_slug: collectionSlug, section_order: sectionOrder, item_code: spot.featured_item?.item_code || undefined })
    if (!target) return
    if (/^https?:\/\//i.test(target)) window.open(target, '_blank', 'noopener,noreferrer')
    else navigate(target)
  }
  return <div className={`lookbook-hotspot-frame ${isRtl ? 'rtl' : 'ltr'}`}>
    <img src={src} alt={alt} loading="lazy" />
    {hotspots.map((spot, index) => {
      const label = t(spot.label_en, spot.label_ar, isArabic ? 'تفاصيل' : 'View detail')
      const description = t(spot.description_en, spot.description_ar)
      const target = spot.featured_item?.item_code ? `/products/${encodeURIComponent(spot.featured_item.item_code)}` : spot.link_url
      return <div className="lookbook-hotspot" key={`${spot.label_en || spot.label_ar || 'spot'}-${index}`} style={{ left: `${Number(spot.x_percent ?? 50)}%`, top: `${Number(spot.y_percent ?? 50)}%` }}>
        <button type="button" className={`lookbook-hotspot-pin ${active === index ? 'active' : ''}`} aria-label={label} aria-expanded={active === index} onClick={() => { setActive(active === index ? null : index); trackEvent('lookbook_hotspot_open', { collection_slug: collectionSlug, section_order: sectionOrder }) }}>+</button>
        {active === index && <div className="lookbook-hotspot-popover" role="dialog" aria-label={label}>
          <strong>{label}</strong>
          {description && <p>{description}</p>}
          {target && (target.startsWith('http') ? <a href={target} target="_blank" rel="noreferrer" onClick={() => goToSpot(spot)}>{isArabic ? 'اكتشف' : 'Explore'} →</a> : <Link to={target} onClick={() => goToSpot(spot)}>{isArabic ? 'اكتشف' : 'Explore'} →</Link>)}
        </div>}
      </div>
    })}
  </div>
}
