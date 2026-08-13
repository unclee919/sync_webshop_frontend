import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getCatalog, getItem, getRecommendations } from '../api/client'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { useComparison } from '../context/ComparisonContext'
import { useUltraExperience } from '../context/UltraExperienceContext'
import QuickView from '../components/QuickView'
import SocialProof from '../components/SocialProof'
import EliteStories from '../components/EliteStories'
import './Landing.css'

function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg> }
function PlusIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg> }
function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.3-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" /></svg> }

function ProductCard({ item, content, lang, onAdd, onQuickView }) {
  const isArabic = lang === 'ar'
  const { add: addToCompare, remove: removeFromCompare, isCompared } = useComparison()
  const { activateProductPalette, beginSharedTransition, prefetchProduct } = useUltraExperience()
  const [hovering, setHovering] = useState(false)
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const oldPrice = Number(item.old_price || 0)
  const price = Number(item.price || 0)
  const isUnavailable = item.available === false || item.in_stock === false

  const handleProductIntent = (event) => {
    activateProductPalette(item)
    prefetchProduct(item.item_code)
    if (event?.currentTarget) beginSharedTransition(item, event.currentTarget.getBoundingClientRect())
  }

  return (
    <article className="home-product-card" onMouseEnter={() => { setHovering(true); prefetchProduct(item.item_code) }} onMouseLeave={() => setHovering(false)}>
      <div className="home-product-media">
                  <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="home-product-image" data-magnetic="true" onMouseEnter={() => prefetchProduct(item.item_code)} onFocus={() => prefetchProduct(item.item_code)} onClick={handleProductIntent}>

          {item.image ? <img src={item.image} alt={item.item_name} loading="lazy" /> : <span className="product-image-placeholder">{item.item_name?.slice(0, 1)}</span>}
          {hovering && content?.product_settings?.enable_video_hover !== 0 && (item.video_url || item.video || item.product_video) && <video className="home-product-hover-video" src={item.video_url || item.video || item.product_video} muted autoPlay loop playsInline aria-label={t('Product preview', 'معاينة المنتج')} />}
        </Link>
        <div className="product-card-badges">
          {item.discount_percentage > 0 && <span className="sale-badge">-{item.discount_percentage}%</span>}
          {item.is_new && <span className="new-badge">{t(content.new_badge_text_en, content.new_badge_text_ar, 'New')}</span>}
        </div>
        <div className="product-action-overlay">
          <button type="button" className="action-btn" onClick={() => onQuickView(item.item_code)}>👁</button>
        </div>
        <button type="button" className={`product-compare-button ${isCompared(item.item_code) ? 'active' : ''}`} onClick={() => isCompared(item.item_code) ? removeFromCompare(item.item_code) : addToCompare(item)} aria-label={t('Compare product', 'مقارنة المنتج')}>⇄</button>
        <button type="button" className="product-favorite" onClick={() => {
          const saved = JSON.parse(localStorage.getItem('sync_webshop_wishlist') || '[]')
          const next = saved.some(s => s.item_code === item.item_code) ? saved.filter(s => s.item_code !== item.item_code) : [...saved, item]
          localStorage.setItem('sync_webshop_wishlist', JSON.stringify(next))
          window.dispatchEvent(new Event('wishlist-updated'))
        }}><HeartIcon /></button>
      </div>
      <div className="home-product-body">
        <Link className="home-product-category" to={`/products?category=${encodeURIComponent(item.item_group || '')}`}>{item.item_group || t(content.category_label_short_en, content.category_label_short_ar, 'Featured')}</Link>
        <h3><Link to={`/products/${encodeURIComponent(item.item_code)}`} onMouseEnter={() => prefetchProduct(item.item_code)} onFocus={() => prefetchProduct(item.item_code)} onClick={handleProductIntent}>{item.item_name}</Link></h3>
        <div className="product-rating"><span>★★★★★</span><small>({item.review_count || 0})</small></div>
        <div className="home-product-footer">
          <div className="home-product-price">
            {price > 0 ? <><strong>{price.toFixed(2)} {item.currency}</strong>{oldPrice > price && <del>{oldPrice.toFixed(2)} {item.currency}</del>}</> : <strong>{t('On request', 'حسب الطلب')}</strong>}
          </div>
          <button type="button" className="add-product-button" onClick={() => onAdd(item)} disabled={isUnavailable}>
            <PlusIcon /><span>{isUnavailable ? t('Unavailable', 'غير متوفر') : t(content.add_to_cart_text_en, content.add_to_cart_text_ar, 'Add')}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Landing() {
  const { content, loading, error } = useContent()
  const { lang, isRtl } = useLanguage()
  const { addItem } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fallbackItems, setFallbackItems] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [quickViewCode, setQuickViewCode] = useState(null)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroCopyY = useTransform(scrollYProgress, [0, 1], [0, -24])

  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const banners = content?.banners || []
  const categories = content?.featured_categories || []
  const configuredSections = content?.landing_sections || []
  const trustBadges = content?.trust_badges || []
  const testimonials = content?.testimonials || []

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % banners.length), 5500)
    return () => clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    if (configuredSections.length > 0) return
    getCatalog({ page: 1, pageSize: 8 }).then(r => setFallbackItems(r?.items || [])).catch(() => {})
  }, [configuredSections.length])

  useEffect(() => {
    if (content?.recommendations_enabled === 0) return
    getRecommendations({ limit: 8 }).then(setRecommendations).catch(() => {})
  }, [content?.recommendations_enabled])

  useEffect(() => {
    const settings = content?.product_settings || {}
    if (settings.enable_recently_viewed === 0) return
    try {
      const codes = JSON.parse(localStorage.getItem('sync_webshop_recently_viewed') || '[]').slice(0, Number(settings.recently_viewed_limit) || 8)
      Promise.all(codes.map((code) => getItem(code).catch(() => null))).then((items) => setRecentlyViewed(items.filter(Boolean)))
    } catch { setRecentlyViewed([]) }
  }, [content?.product_settings?.enable_recently_viewed, content?.product_settings?.recently_viewed_limit])

  const sections = useMemo(() => configuredSections.length ? configuredSections : (fallbackItems.length ? [{ title_en: 'New arrivals', title_ar: 'وصل حديثاً', items: fallbackItems }] : []), [configuredSections, fallbackItems])
  const hero = banners[currentSlide]
  const heroTitle = hero ? t(hero.title, hero.title_ar) : t(content?.hero_quote_en, content?.hero_quote_ar, 'Sync Webshop, made for everyday living.')
  const heroSubtitle = hero ? t(hero.subtitle, hero.subtitle_ar) : t(content?.tagline_en, content?.tagline_ar, 'Everyday essentials, thoughtfully selected.')

  if (loading && !content) return <div className="landing-loading"><div className="loading-block loading-hero" /><div className="container loading-line" /><div className="container loading-grid" /></div>

  return (
    <div className={`landing-page ${isRtl ? 'rtl' : 'ltr'}`}>
      <motion.section ref={heroRef} className="home-hero" style={hero?.image ? { backgroundImage: 'none' } : undefined}>
        {hero?.image && <motion.div className="hero-parallax-media" style={{ y: heroParallaxY, backgroundImage: `linear-gradient(90deg, rgba(10, 39, 34, 0.8) 0%, rgba(10, 39, 34, 0.4) 100%), url(${hero.image})` }} />}
        <div className="container hero-inner">
          <motion.div className="hero-copy" style={{ y: heroCopyY }}>
            <span className="hero-eyebrow">{t('Thoughtfully selected', 'مختارات بعناية')}</span>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
            <div className="hero-actions">
              <Link className="primary-button" to={hero?.link_url || '/products'}>{t(content?.shop_now_text_en, content?.shop_now_text_ar, 'Shop now')} <ArrowIcon /></Link>
              <Link className="text-button" to="/products">{t(content?.all_products_text_en, content?.all_products_text_ar, 'Explore all products')} <ArrowIcon /></Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <EliteStories content={content} />

            {categories.length > 0 && <section className="home-section container">
        <div className="home-section-heading"><div><h2>{t(content?.best_categories_text_en, content?.best_categories_text_ar, 'Best Categories')}</h2></div><Link to="/products" className="section-view-all">{t(content?.view_all_text_en, content?.view_all_text_ar, 'View All')}<ArrowIcon /></Link></div>
        <div className="category-rail">{categories.slice(0, 8).map((cat, i) => <Link key={i} to={`/products?category=${encodeURIComponent(cat.item_group)}`} className="category-tile"><div className="category-tile-image">{cat.image ? <img src={cat.image} alt="" /> : <span>{i+1}</span>}</div><div className="category-tile-copy"><h3>{t(cat.label_en, cat.label_ar, cat.item_group)}</h3><span>{t('Explore collection', 'استكشف المجموعة')} →</span></div></Link>)}</div>
      </section>}

      {content?.recommendations_enabled !== 0 && recommendations.length > 0 && <section className="home-section smart-recommendations"><div className="container"><div className="home-section-heading"><div><span className="section-kicker">{t('Smart selection', 'اختيار ذكي')}</span><h2>{t(content?.recommendations_title_en, content?.recommendations_title_ar, 'Picked for you')}</h2></div><Link to="/products" className="section-view-all">{t(content?.view_all_text_en, content?.view_all_text_ar, 'View All')}<ArrowIcon /></Link></div><div className="home-product-grid">{recommendations.map(item => <ProductCard key={item.item_code} item={item} content={content} lang={lang} onAdd={addItem} onQuickView={setQuickViewCode} />)}</div></div></section>}

      {content?.product_settings?.enable_recently_viewed !== 0 && recentlyViewed.length > 0 && <section className="home-section recently-viewed-section"><div className="container"><div className="home-section-heading"><div><h2>{t(content?.product_settings?.recently_viewed_title_en, content?.product_settings?.recently_viewed_title_ar, 'Recently viewed')}</h2></div></div><div className="home-product-grid">{recentlyViewed.map(item => <ProductCard key={item.item_code} item={item} content={content} lang={lang} onAdd={addItem} onQuickView={setQuickViewCode} />)}</div></div></section>}

      {sections.map((s, i) => <section key={i} className={`home-section ${i % 2 ? 'soft-section' : ''}`}>
<div className="container"><div className="home-section-heading"><div><h2>{t(s.title_en, s.title_ar)}</h2></div><Link to="/products" className="section-view-all">{t(content?.view_all_text_en, content?.view_all_text_ar, 'View All')}<ArrowIcon /></Link></div><div className="home-product-grid">{s.items?.map(item => <ProductCard key={item.item_code} item={item} content={content} lang={lang} onAdd={addItem} onQuickView={setQuickViewCode} />)}</div></div></section>)}

      {trustBadges.length > 0 && <section className="benefits-section"><div className="container benefits-grid">{trustBadges.slice(0, 4).map((b, i) => <div className="benefit-item" key={i}><div className="benefit-icon" dangerouslySetInnerHTML={{ __html: b.icon }} /><div><h3>{t(b.label_en, b.label_ar)}</h3><p>{t(b.description_en, b.description_ar)}</p></div></div>)}</div></section>}

      {testimonials.length > 0 && <section className="home-section container"><div className="home-section-heading"><div><h2>{t('What our customers say', 'ماذا يقول عملاؤنا')}</h2></div></div><div className="testimonial-grid">{testimonials.slice(0, 3).map((item, index) => <article className="testimonial-card" key={index}><blockquote>“{t(item.quote_en, item.quote_ar)}”</blockquote><footer><strong>{item.author}</strong><span>{item.author_title}</span></footer></article>)}</div></section>}

      <SocialProof showFeed />
      {quickViewCode && <QuickView itemCode={quickViewCode} onClose={() => setQuickViewCode(null)} />}
    </div>
  )
}
