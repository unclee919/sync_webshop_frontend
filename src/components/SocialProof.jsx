import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './SocialProof.css'

const DEFAULT_EVENTS = []
export default function SocialProof({ showFeed = false }) {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const [eventIndex, setEventIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const events = useMemo(() => content?.social_proof_events?.length ? content.social_proof_events : DEFAULT_EVENTS, [content?.social_proof_events])
  const purchaseEvents = useMemo(() => events.filter((entry) => !entry.event_type || entry.event_type === 'Purchase'), [events])
  const viewerEvent = useMemo(() => events.find((entry) => entry.event_type === 'Viewer Pulse'), [events])
  const feedItems = content?.social_feed_items || []
  const event = purchaseEvents[eventIndex % Math.max(purchaseEvents.length, 1)]

  useEffect(() => {
    if (content?.experience_settings?.social_proof_enabled === 0 || content?.show_live_purchase_notifications === 0 || !purchaseEvents.length) return undefined
    const first = setTimeout(() => setVisible(true), 4200)
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setEventIndex((index) => (index + 1) % purchaseEvents.length); setVisible(true) }, 500)
    }, 13000)
    return () => { clearTimeout(first); clearInterval(timer) }
  }, [content?.show_live_purchase_notifications, content?.experience_settings?.social_proof_enabled, purchaseEvents.length])

  return <>
    {content?.experience_settings?.social_proof_enabled !== 0 && visible && event && <div className={`purchase-proof ${isRtl ? 'rtl' : 'ltr'}`} role="status"><span className="purchase-proof-check">✓</span><div><strong>{isArabic ? 'تم الشراء للتو' : 'Just purchased'}</strong><span>{isArabic ? `${event.item_ar || event.item_en || 'اختيار مميز'}${event.city_ar ? ` · ${event.city_ar}` : ''}` : `${event.item_en || event.item_ar || 'A considered selection'}${event.city_en ? ` · ${event.city_en}` : ''}`}</span><small>{isArabic ? `منذ ${event.minutes || 5} دقائق` : `${event.minutes || 5} minutes ago`}</small></div><button type="button" onClick={() => setVisible(false)} aria-label={isArabic ? 'إغلاق' : 'Close'}>×</button></div>}
    {content?.experience_settings?.social_proof_viewer_enabled !== 0 && viewerEvent && <div className={`viewer-pulse ${isRtl ? 'rtl' : 'ltr'}`} role="status"><span aria-hidden="true">◌</span>{isArabic ? ((content.experience_settings.social_proof_viewer_template_ar || '{count} أشخاص يشاهدون هذا الآن').replace('{count}', viewerEvent.count || viewerEvent.viewer_count || 3)) : ((content.experience_settings.social_proof_viewer_template_en || '{count} people are viewing this now').replace('{count}', viewerEvent.count || viewerEvent.viewer_count || 3))}</div>}
    {showFeed && content?.experience_settings?.social_proof_enabled !== 0 && <section className="social-feed-section container"><div className="home-section-heading"><div><span className="section-kicker">{isArabic ? 'من مجتمعنا' : 'From our community'}</span><h2>{isArabic ? 'اكتشف الإلهام' : 'Find your inspiration'}</h2></div><span className="social-feed-handle">@syncwebshop</span></div><div className="social-feed-grid">{(feedItems.length ? feedItems : events).slice(0, 4).map((item, index) => <Link className="social-feed-card" key={`${item.item_code || index}-${index}`} to={item.item_code ? `/products/${encodeURIComponent(item.item_code)}` : '/products'}><div className="social-feed-image">{item.image ? <img src={item.image} alt="" loading="lazy" /> : <span>{index + 1}</span>}</div><div className="social-feed-copy"><strong>{isArabic ? (item.caption_ar || item.item_ar || 'مختارات جميلة') : (item.caption_en || item.item_en || 'Thoughtfully selected')}</strong><span>{isArabic ? 'تسوق الإطلالة' : 'Shop the look'} →</span></div></Link>)}</div></section>}
  </>
}
