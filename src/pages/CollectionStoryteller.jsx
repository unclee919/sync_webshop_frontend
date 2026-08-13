import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent } from '../utils/analytics'
import SEOHead from '../components/SEOHead'
import LookbookHotspots from '../components/LookbookHotspots'
import './CollectionStoryteller.css'

function bodyMarkup(value) {
  return value ? <div className="editorial-body" dangerouslySetInnerHTML={{ __html: value }} /> : null
}

export default function CollectionStoryteller() {
  const { slug } = useParams()
  const { content, loading } = useContent()
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const collections = content?.editorial_collections || []
  const collection = collections.find((entry) => entry.slug === slug)
  const t = (en, ar, fallback = '') => isArabic ? (ar || en || fallback) : (en || ar || fallback)

  useEffect(() => {
    if (collection) trackEvent('editorial_collection_view', { collection_slug: collection.slug })
  }, [collection?.slug])

  if (loading && !content) return <div className="collection-loading container"><div className="editorial-skeleton editorial-skeleton-hero" /><div className="editorial-skeleton editorial-skeleton-line" /><div className="editorial-skeleton editorial-skeleton-block" /></div>
  if (!collection) return <div className={`collection-not-found container ${isRtl ? 'rtl' : 'ltr'}`}><SEOHead title={isArabic ? 'المجموعة غير موجودة' : 'Collection not found'} /><h1>{isArabic ? 'لم نجد هذه القصة.' : 'We could not find this story.'}</h1><Link className="primary-button" to="/">{isArabic ? 'العودة إلى الرئيسية' : 'Return home'}</Link></div>

  const title = t(collection.title_en, collection.title_ar)
  const intro = t(collection.intro_en, collection.intro_ar)
  const coverAlt = t(collection.cover_image_alt_en, collection.cover_image_alt_ar, title)

  return <div className={`collection-storyteller ${isRtl ? 'rtl' : 'ltr'}`} style={{ '--collection-accent': collection.accent_color || '#E6B85C' }}>
    <SEOHead title={title} description={intro?.replace(/<[^>]+>/g, '')} image={collection.cover_image} type="article" />
    <header className="editorial-hero">
      {collection.cover_image && <motion.img src={collection.cover_image} alt={coverAlt} initial={{ scale: 1.04, opacity: .7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .8 }} />}
      <div className="editorial-hero-overlay" />
      <div className="container editorial-hero-copy"><span className="editorial-kicker">{isArabic ? 'قصة المجموعة' : 'Collection story'}</span><h1>{title}</h1>{bodyMarkup(intro)}<a className="editorial-scroll-cue" href="#editorial-story">{isArabic ? 'اكتشف القصة ↓' : 'Discover the story ↓'}</a></div>
    </header>

    <main id="editorial-story" className="editorial-main container">
      {(collection.sections || []).map((section, index) => {
        const layout = section.layout || 'Split Image Right'
        const sectionTitle = t(section.title_en, section.title_ar)
        const eyebrow = t(section.eyebrow_en, section.eyebrow_ar)
        const body = t(section.body_en, section.body_ar)
        const cta = t(section.cta_text_en, section.cta_text_ar, isArabic ? 'استكشف المجموعة' : 'Explore the edit')
        const image = section.image
        const image2 = section.image_2
        const featured = section.featured_item
        if (layout === 'Quote') return <motion.blockquote className="editorial-quote" key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>{sectionTitle && <strong>{sectionTitle}</strong>}{bodyMarkup(body)}</motion.blockquote>
        if (layout === 'Gallery') return <motion.section className="editorial-section editorial-gallery" key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><div className="editorial-copy">{eyebrow && <span className="editorial-kicker">{eyebrow}</span>}{sectionTitle && <h2>{sectionTitle}</h2>}{bodyMarkup(body)}</div><div className="editorial-gallery-grid">{[image, image2].filter(Boolean).map((src, imageIndex) => <LookbookHotspots key={src} src={src} alt={`${sectionTitle || title} ${imageIndex + 1}`} hotspots={content?.experience_settings?.lookbook_hotspots_enabled !== 0 && collection.hotspots_enabled !== false ? (imageIndex === 0 ? (section.hotspots || []) : []) : []} collectionSlug={collection.slug} sectionOrder={section.sort_order} />)}</div></motion.section>
        if (layout === 'Product Feature') return <motion.section className="editorial-section editorial-product-feature" key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><div className="editorial-product-image">{(image || featured?.image) && <img src={image || featured.image} alt={featured?.item_name || sectionTitle || title} loading="lazy" />}</div><div className="editorial-copy">{eyebrow && <span className="editorial-kicker">{eyebrow}</span>}{sectionTitle && <h2>{sectionTitle}</h2>}{bodyMarkup(body)}{featured?.item_code && <Link className="editorial-link" to={`/products/${encodeURIComponent(featured.item_code)}`} onClick={() => trackEvent('editorial_featured_product_click', { collection_slug: collection.slug })}>{cta} →</Link>}</div></motion.section>
        const imageFirst = layout === 'Split Image Left'
        return <motion.section className={`editorial-section editorial-split ${imageFirst ? 'image-first' : 'copy-first'}`} key={index} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><div className="editorial-copy">{eyebrow && <span className="editorial-kicker">{eyebrow}</span>}{sectionTitle && <h2>{sectionTitle}</h2>}{bodyMarkup(body)}{section.link_url && <a className="editorial-link" href={section.link_url} onClick={() => trackEvent('editorial_section_cta_click', { collection_slug: collection.slug })}>{cta} →</a>}</div>{image && <div className="editorial-image-frame">{content?.experience_settings?.lookbook_hotspots_enabled !== 0 && collection.hotspots_enabled !== false && section.hotspots?.length ? <LookbookHotspots src={image} alt={sectionTitle || title} hotspots={section.hotspots} collectionSlug={collection.slug} sectionOrder={section.sort_order} /> : <img src={image} alt={sectionTitle || title} loading="lazy" />}</div>}</motion.section>
      })}
      {collection.cta_url && <div className="editorial-end-cta"><Link className="primary-button" to={collection.cta_url} onClick={() => trackEvent('editorial_collection_cta_click', { collection_slug: collection.slug })}>{t(collection.cta_text_en, collection.cta_text_ar, isArabic ? 'استكشف المجموعة' : 'Explore the edit')} →</Link></div>}
    </main>
  </div>
}
