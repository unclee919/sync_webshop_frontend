import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLookbookHotspots } from '../api/client'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './MasterTierHotspots.css'

export default function MasterTierHotspots() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const settings = content?.master_tier || {}
  const [hotspots, setHotspots] = useState([])
  const [active, setActive] = useState(null)
  const enabled = settings.enabled !== 0 && settings.hotspots_enabled !== 0

  useEffect(() => {
    if (!enabled) return
    getLookbookHotspots(24).then((rows) => setHotspots(Array.isArray(rows) ? rows : [])).catch(() => setHotspots([]))
  }, [enabled])

  if (!enabled || hotspots.length === 0) return null
  const first = hotspots[0]
  const title = isArabic ? (content?.hotspots_title_ar || 'اكتشف التفاصيل') : (content?.hotspots_title_en || 'Shop the scene')
  const intro = isArabic ? (content?.hotspots_intro_ar || 'تسوق التفاصيل التي تصنع اللحظة.') : (content?.hotspots_intro_en || 'The considered details that make the moment.')
  return <section className={`master-tier-hotspots container ${isRtl ? 'rtl' : 'ltr'}`} aria-labelledby="hotspot-title"><div className="hotspots-heading"><div><span className="section-kicker">{isArabic ? 'اختيارات منسقة' : 'A considered edit'}</span><h2 id="hotspot-title">{title}</h2><p>{intro}</p></div></div><div className="hotspot-canvas"><img src={first.image_url} alt={isArabic ? 'مشهد مختار' : 'Curated scene'} loading="lazy" />{hotspots.filter((item) => item.image_url === first.image_url).map((item) => <button type="button" className={`hotspot-pin ${active === item.name ? 'active' : ''}`} key={item.name} style={{ left: `${item.coord_x}%`, top: `${item.coord_y}%` }} onClick={() => setActive(active === item.name ? null : item.name)} aria-label={isArabic ? (item.title_ar || item.title_en) : (item.title_en || item.title_ar)}><span>+</span></button>)}{active && (() => { const item = hotspots.find((row) => row.name === active); if (!item) return null; return <div className="hotspot-popover"><button type="button" className="hotspot-popover-close" onClick={() => setActive(null)} aria-label={isArabic ? 'إغلاق' : 'Close'}>×</button><span className="section-kicker">{isArabic ? (item.title_ar || item.title_en) : (item.title_en || item.title_ar)}</span>{item.item && <><strong>{item.item.item_name}</strong><Link to={`/products/${encodeURIComponent(item.item.item_code)}`} onClick={() => setActive(null)}>{isArabic ? 'عرض المنتج' : 'View product'} →</Link></>}</div>})()}</div></section>
}
