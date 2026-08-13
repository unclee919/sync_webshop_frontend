import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent } from '../utils/analytics'
import './EditorialCollectionRail.css'

export default function EditorialCollectionRail({ collections = [] }) {
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  if (!collections.length) return null
  const t = (en, ar, fallback = '') => isArabic ? (ar || en || fallback) : (en || ar || fallback)
  return <section className={`editorial-rail container ${isRtl ? 'rtl' : 'ltr'}`} aria-labelledby="editorial-rail-title">
    <div className="editorial-rail-heading"><div><span className="section-kicker">{isArabic ? 'مجلة المتجر' : 'The journal'}</span><h2 id="editorial-rail-title">{isArabic ? 'قصص منسقة للعيش اليومي' : 'Stories behind the edit'}</h2></div><span className="editorial-rail-rule" /></div>
    <div className="editorial-rail-grid">{collections.slice(0, 4).map((collection) => <Link key={collection.slug} to={`/collections/${encodeURIComponent(collection.slug)}`} className="editorial-rail-card" onClick={() => trackEvent('editorial_collection_card_click', { collection_slug: collection.slug })}><div className="editorial-rail-image">{collection.cover_image ? <img src={collection.cover_image} alt={t(collection.cover_image_alt_en, collection.cover_image_alt_ar, t(collection.title_en, collection.title_ar))} loading="lazy" /> : <span>{t(collection.title_en, collection.title_ar).slice(0, 1)}</span>}<i style={{ backgroundColor: collection.accent_color || '#E6B85C' }} /></div><div className="editorial-rail-copy"><span>{isArabic ? 'اقرأ القصة' : 'Read the story'} ↗</span><h3>{t(collection.title_en, collection.title_ar)}</h3></div></Link>)}</div>
  </section>
}
