import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent } from '../utils/analytics'
import './LuxuryLiveSocial.css'

function isVideo(url = '') { return /\.(mp4|webm|ogg)(\?|$)/i.test(url) }
function liveSessionKey(session) { return session?.name || session?.title_en || session?.title_ar || '' }
function currentPulseKey(pulse) { return pulse?.text_en || pulse?.text_ar || '' }

export default function LuxuryLiveSocial() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const settings = content?.luxury_tier || {}
  const [pulseIndex, setPulseIndex] = useState(0)
  const enabled = settings.enabled !== 0
  const sessions = Array.isArray(settings.live_sessions) ? settings.live_sessions : []
  const pulse = Array.isArray(settings.social_pulse) ? settings.social_pulse : []
  const wall = Array.isArray(settings.community_wall) ? settings.community_wall : []
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))

  useEffect(() => {
    if (pulse.length < 2) return undefined
    const timer = window.setInterval(() => setPulseIndex((current) => (current + 1) % pulse.length), 4600)
    return () => window.clearInterval(timer)
  }, [pulse.length])

  useEffect(() => {
    if (enabled && liveSessionKey(sessions[0])) trackEvent('luxury_live_session_impression', { session_key: liveSessionKey(sessions[0]), viewer_count: Number(sessions[0]?.viewer_count || 0) })
  }, [enabled, sessions.length, sessions[0]?.name])

  useEffect(() => {
    if (enabled && currentPulseKey(pulse[pulseIndex])) trackEvent('luxury_social_pulse_impression', { city: pulse[pulseIndex]?.city || 'unknown', pulse_index: pulseIndex })
  }, [enabled, pulseIndex, pulse.length])

  if (!enabled || (!sessions.length && !pulse.length && !wall.length)) return null
  const currentPulse = pulse[pulseIndex]
  const live = sessions[0]
  return <section className={`luxury-live-social container ${isRtl ? 'rtl' : 'ltr'}`}>
    {currentPulse && <div className="social-pulse-ticker" role="status"><span className="pulse-live-dot" /><strong>{t('Live pulse', 'نبض مباشر')}</strong><span>{t(currentPulse.text_en, currentPulse.text_ar)}</span>{currentPulse.city && <small>{currentPulse.city}</small>}</div>}
    {live && <div className="live-shopping-card"><div className="live-shopping-media">{isVideo(live.stream_url) ? <video src={live.stream_url} controls muted playsInline preload="metadata" onPlay={() => trackEvent('luxury_live_stream_start', { session_key: liveSessionKey(live), viewer_count: Number(live.viewer_count || 0) })} /> : <iframe src={live.stream_url} title={t(live.title_en, live.title_ar)} loading="lazy" onLoad={() => trackEvent('luxury_live_stream_ready', { session_key: liveSessionKey(live) })} allow="autoplay; encrypted-media; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" />}</div><div className="live-shopping-copy"><span className="live-badge"><i />{t('ON AIR', 'مباشر')}</span><h2>{t(live.title_en, live.title_ar)}</h2><p>{t('Join the live edit and discover the story behind the selection.', 'انضم إلى الجلسة الحية واكتشف قصة الاختيارات.')}</p><div className="live-meta"><span>{Number(live.viewer_count || 0).toLocaleString()} {t('watching now', 'يشاهدون الآن')}</span>{live.featured_item && <Link to={`/products/${encodeURIComponent(live.featured_item.item_code)}`} onClick={() => trackEvent('luxury_live_feature_click', { session_key: liveSessionKey(live), item_code: live.featured_item.item_code })}>{t('Shop featured piece', 'تسوق القطعة المميزة')} →</Link>}</div>{live.featured_item && <div className="live-featured-product">{live.featured_item.image && <img src={live.featured_item.image} alt="" loading="lazy" />}<span><strong>{live.featured_item.item_name}</strong><small>{live.featured_item.price != null ? `${Number(live.featured_item.price).toFixed(2)} SAR` : t('View item', 'عرض المنتج')}</small></span></div>}</div></div>}
    {wall.length > 0 && <div className="community-wall"><div className="luxury-section-heading"><div><span className="section-kicker">{t('FROM OUR COMMUNITY', 'من مجتمعنا')}</span><h2>{t('Real spaces, considered details.', 'مساحات حقيقية وتفاصيل مدروسة.')}</h2></div><p>{t('A quiet gallery of customer moments, curated from Desk.', 'معرض هادئ من لحظات العملاء، منسق من Desk.')}</p></div><div className="community-grid">{wall.slice(0, 8).map((post, index) => <article className={`community-post community-post-${index % 4}`} key={`${post.author_name}-${index}`}>{post.image_url && <img src={post.image_url} alt={post.caption || post.author_name} loading="lazy" />}{post.caption && <p>“{post.caption}”</p>}<div className="community-post-footer"><span>{post.author_name}</span>{post.item && <Link to={`/products/${encodeURIComponent(post.item.item_code)}`} onClick={() => trackEvent('luxury_community_post_click', { item_code: post.item.item_code, post_index: index })}>{t('View item', 'عرض المنتج')}</Link>}</div></article>)}</div></div>}
  </section>
}
