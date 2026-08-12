import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './SocialProof.css'

const DEFAULT_EVENTS = [
  { city_en: 'Riyadh', city_ar: 'الرياض', item_en: 'Handmade Leather Journal', item_ar: 'دفتر جلدي مصنوع يدوياً', item_code: 'ELITE-LUX-001', minutes: 4 },
  { city_en: 'Jeddah', city_ar: 'جدة', item_en: 'Soft Glow Table Lamp', item_ar: 'مصباح طاولة بإضاءة ناعمة', item_code: 'SYNC-LAMP-001', minutes: 7 },
  { city_en: 'Dubai', city_ar: 'دبي', item_en: 'Sage Trim Travel Pouch', item_ar: 'حقيبة سفر بحافة خضراء', item_code: 'SYNC-POUCH-001', minutes: 11 },
]

export default function SocialProof({ showFeed = false }) {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const [eventIndex, setEventIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const events = useMemo(() => content?.social_proof_events?.length ? content.social_proof_events : DEFAULT_EVENTS, [content?.social_proof_events])
  const feedItems = content?.social_feed_items || []
  const event = events[eventIndex % events.length]

  useEffect(() => {
    if (content?.show_live_purchase_notifications === 0 || !events.length) return undefined
    const first = setTimeout(() => setVisible(true), 4200)
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setEventIndex((index) => (index + 1) % events.length); setVisible(true) }, 500)
    }, 13000)
    return () => { clearTimeout(first); clearInterval(timer) }
  }, [content?.show_live_purchase_notifications, events.length])

  return <>
    {visible && event && <div className={`purchase-proof ${isRtl ? 'rtl' : 'ltr'}`} role="status"><span className="purchase-proof-check">✓</span><div><strong>{isArabic ? 'تم الشراء للتو' : 'Just purchased'}</strong><span>{isArabic ? `${event.item_ar || event.item_en} · ${event.city_ar || event.city_en}` : `${event.item_en || event.item_ar} · ${event.city_en || event.city_ar}`}</span><small>{isArabic ? `منذ ${event.minutes || 5} دقائق` : `${event.minutes || 5} minutes ago`}</small></div><button type="button" onClick={() => setVisible(false)} aria-label={isArabic ? 'إغلاق' : 'Close'}>×</button></div>}
    {showFeed && <section className="social-feed-section container"><div className="home-section-heading"><div><span className="section-kicker">{isArabic ? 'من مجتمعنا' : 'From our community'}</span><h2>{isArabic ? 'اكتشف الإلهام' : 'Find your inspiration'}</h2></div><span className="social-feed-handle">@syncwebshop</span></div><div className="social-feed-grid">{(feedItems.length ? feedItems : events).slice(0, 4).map((item, index) => <Link className="social-feed-card" key={`${item.item_code || index}-${index}`} to={item.item_code ? `/products/${encodeURIComponent(item.item_code)}` : '/products'}><div className="social-feed-image">{item.image ? <img src={item.image} alt="" loading="lazy" /> : <span>{index + 1}</span>}</div><div className="social-feed-copy"><strong>{isArabic ? (item.caption_ar || item.item_ar || 'مختارات جميلة') : (item.caption_en || item.item_en || 'Thoughtfully selected')}</strong><span>{isArabic ? 'تسوق الإطلالة' : 'Shop the look'} →</span></div></Link>)}</div></section>}
  </>
}
