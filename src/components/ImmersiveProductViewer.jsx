import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useUltraExperience } from '../context/UltraExperienceContext'
import './ImmersiveProductViewer.css'

function mediaUrl(media) {
  if (typeof media === 'string') return media
  return media?.image || media?.url || media?.src || ''
}

export default function ImmersiveProductViewer({ item, enabled = true }) {
  const { lang, isRtl } = useLanguage()
  const { palette } = useUltraExperience()
  const isArabic = lang === 'ar'
  const [frame, setFrame] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const dragStart = useRef(null)
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  const images = useMemo(() => {
    const candidates = item?.images || item?.gallery_images || item?.media || []
    const list = Array.isArray(candidates) ? candidates.map(mediaUrl).filter(Boolean) : []
    return [...new Set([item?.image, ...list].filter(Boolean))]
  }, [item])
  const video = item?.video_url || item?.video || item?.product_video
  const frameCount = images.length
  const activeImage = images[frame] || images[0]

  useEffect(() => {
    setFrame(0)
    setShowVideo(false)
  }, [item?.item_code])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setExpanded(false)
      if (event.key === 'ArrowRight') setFrame((current) => (current + 1) % Math.max(frameCount, 1))
      if (event.key === 'ArrowLeft') setFrame((current) => (current - 1 + Math.max(frameCount, 1)) % Math.max(frameCount, 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [frameCount])

  const rotate = (direction) => setFrame((current) => (current + direction + Math.max(frameCount, 1)) % Math.max(frameCount, 1))
  const onPointerDown = (event) => { dragStart.current = event.clientX }
  const onPointerUp = (event) => {
    if (dragStart.current === null || frameCount < 2) return
    const delta = event.clientX - dragStart.current
    if (Math.abs(delta) > 24) rotate(delta > 0 ? -1 : 1)
    dragStart.current = null
  }

  if (!item) return null
  if (enabled === false) return <div className="immersive-viewer-fallback">{activeImage ? <img src={activeImage} alt={item.item_name} /> : <div className="no-image-large">{t('No image', 'لا توجد صورة')}</div>}</div>
  return <>
    <div className={`immersive-viewer ${isRtl ? 'rtl' : 'ltr'} ${expanded ? 'is-expanded' : ''}`} style={{ '--viewer-accent': palette?.accent, '--viewer-primary': palette?.primary }}>
      <div className="immersive-viewer-main" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { dragStart.current = null }}>
        {showVideo && video ? <video className="immersive-video" src={video} controls autoPlay muted playsInline /> : activeImage ? <motion.img layoutId={`product-media-${item.item_code}`} key={activeImage} className="immersive-product-image" src={activeImage} alt={item.item_name} initial={{ opacity: .5, scale: .985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .2 }} draggable="false" /> : <div className="no-image-large">{t('No image', 'لا توجد صورة')}</div>}
        <div className="immersive-viewer-sheen" aria-hidden="true" />
        <button type="button" className="immersive-expand" onClick={() => setExpanded((value) => !value)} aria-label={t('Open fullscreen', 'فتح ملء الشاشة')}>{expanded ? '×' : '↗'}</button>
        {frameCount > 1 && <><button type="button" className="immersive-rotate rotate-prev" onClick={() => rotate(-1)} aria-label={t('Previous view', 'المشهد السابق')}>‹</button><button type="button" className="immersive-rotate rotate-next" onClick={() => rotate(1)} aria-label={t('Next view', 'المشهد التالي')}>›</button></>}
        <div className="immersive-viewer-caption"><span className="immersive-orbit-dot" />{frameCount > 1 ? t('Drag to explore every angle', 'اسحب لاستكشاف كل الزوايا') : t('Premium product view', 'عرض فاخر للمنتج')}</div>
      </div>
      <div className="immersive-viewer-toolbar">
        <div className="immersive-thumbs">{images.slice(0, 8).map((image, index) => <button type="button" key={image} className={index === frame ? 'active' : ''} onClick={() => { setFrame(index); setShowVideo(false) }} aria-label={`${t('View', 'عرض')} ${index + 1}`}><img src={image} alt="" /></button>)}</div>
        <div className="immersive-viewer-actions">{video && <button type="button" className={showVideo ? 'active' : ''} onClick={() => setShowVideo((value) => !value)}>{showVideo ? t('Photos', 'الصور') : t('Play video', 'شغل الفيديو')}</button>}<span>{frameCount > 1 ? `${frame + 1}/${frameCount}` : t('Studio view', 'عرض استوديو')}</span></div>
      </div>
    </div>
    <AnimatePresence>{expanded && <motion.div className="immersive-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setExpanded(false)}><motion.div className="immersive-expanded-card" initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }} onClick={(event) => event.stopPropagation()}><div className="immersive-expanded-media">{activeImage && <img src={activeImage} alt={item.item_name} />}</div><button type="button" className="immersive-expanded-close" onClick={() => setExpanded(false)}>×</button></motion.div></motion.div>}</AnimatePresence>
  </>
}
