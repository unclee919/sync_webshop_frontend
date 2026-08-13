import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './EliteStories.css'

export default function EliteStories({ content }) {
  const { lang, isRtl } = useLanguage()
  const [active, setActive] = useState(null)
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const sourceStories = content?.stories || []
  const fallbackStories = useMemo(() => {
    if (sourceStories.length) return sourceStories
    return (content?.featured_categories || []).slice(0, 6).map((category, index) => ({
      image: category.image,
      title_en: category.label_en || category.item_group || `Edit ${index + 1}`,
      title_ar: category.label_ar || category.item_group || `اختيار ${index + 1}`,
      subtitle_en: 'Shop the edit',
      subtitle_ar: 'تسوق المجموعة',
      link_url: `/products?category=${encodeURIComponent(category.item_group || '')}`,
      accent_color: index % 2 ? '#2D8B72' : '#E6B85C',
    }))
  }, [content?.featured_categories, sourceStories])
  const stories = fallbackStories.filter((story) => story.is_active !== 0).slice(0, 8)
  const title = t(content?.stories_title_en, content?.stories_title_ar, 'The edit, in moments')

  useEffect(() => {
    if (!active) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setActive(null)
      if (event.key === 'ArrowRight') setActive((current) => Math.min(stories.length - 1, (current ?? 0) + (isRtl ? -1 : 1)))
      if (event.key === 'ArrowLeft') setActive((current) => Math.max(0, (current ?? 0) - (isRtl ? -1 : 1)))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, isRtl, stories.length])

  if (content?.stories_enabled === 0 || !stories.length) return null
  const story = stories[active ?? 0]

  return <>
    <section className={`elite-stories container ${isRtl ? 'rtl' : 'ltr'}`} aria-labelledby="elite-stories-title">
      <div className="elite-stories-heading">
        <div><span className="section-kicker">{t('Curated today', 'مختارات اليوم')}</span><h2 id="elite-stories-title">{title}</h2></div>
        <span className="elite-stories-hint">{t('Tap to explore', 'اضغط للاستكشاف')}</span>
      </div>
      <div className="elite-stories-rail" role="list">
        {stories.map((item, index) => <button type="button" role="listitem" className="elite-story" key={`${item.title_en || item.title_ar}-${index}`} onClick={() => setActive(index)} style={{ '--story-accent': item.accent_color || '#E6B85C' }}>
          <span className="elite-story-ring"><span className="elite-story-image">{item.image ? <img src={item.image} alt="" loading="lazy" /> : <span>{String(index + 1).padStart(2, '0')}</span>}</span></span>
          <strong>{t(item.title_en, item.title_ar, `Story ${index + 1}`)}</strong>
        </button>)}
      </div>
    </section>

    <AnimatePresence>
      {active !== null && story && <motion.div className="elite-story-modal" role="dialog" aria-modal="true" aria-label={t(story.title_en, story.title_ar, 'Story')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
        <motion.div className="elite-story-modal-card" initial={{ y: 24, scale: .96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: .96, opacity: 0 }} onClick={(event) => event.stopPropagation()}>
          <button type="button" className="elite-story-close" aria-label={t('Close', 'إغلاق')} onClick={() => setActive(null)}>×</button>
          <div className="elite-story-modal-media" style={{ '--story-accent': story.accent_color || '#E6B85C' }}>{story.image ? <img src={story.image} alt={t(story.title_en, story.title_ar)} /> : <span>{String((active ?? 0) + 1).padStart(2, '0')}</span>}</div>
          <div className="elite-story-modal-copy"><span className="section-kicker">{t(story.subtitle_en, story.subtitle_ar, 'A considered edit')}</span><h2>{t(story.title_en, story.title_ar, 'Story')}</h2>{story.link_url && <Link className="primary-button" to={story.link_url} onClick={() => setActive(null)}>{t('Shop this story', 'تسوق هذه المجموعة')} →</Link>}</div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </>
}
