import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCatalog } from '../api/client'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './Landing.css'

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
}

function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.3-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" /></svg>
}

function ProductCard({ item, content, lang, onAdd }) {
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const oldPrice = Number(item.old_price || 0)
  const price = Number(item.price || 0)
  const isUnavailable = item.available === false || item.in_stock === false || item.is_stock_item === false

  return (
    <article className="home-product-card">
      <div className="home-product-media">
        <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="home-product-image">
          {item.image ? <img src={item.image} alt={item.item_name} loading="lazy" /> : <span className="product-image-placeholder">{item.item_name?.slice(0, 1) || 'S'}</span>}
        </Link>
        <div className="product-card-badges">
          {item.discount_percentage > 0 && <span className="sale-badge">-{item.discount_percentage}%</span>}
          {item.is_new && <span className="new-badge">{t(content.new_badge_text_en, content.new_badge_text_ar, 'New')}</span>}
        </div>
        <button type="button" className="product-favorite" aria-label={t('Add to wishlist', 'إضافة إلى المفضلة')} onClick={() => {
          const saved = JSON.parse(localStorage.getItem('sync_webshop_wishlist') || '[]')
          const next = saved.some((savedItem) => savedItem.item_code === item.item_code)
            ? saved.filter((savedItem) => saved.item_code !== item.item_code)
            : [...saved, item]
          localStorage.setItem('sync_webshop_wishlist', JSON.stringify(next))
          window.dispatchEvent(new Event('wishlist-updated'))
        }}><HeartIcon /></button>
      </div>
      <div className="home-product-body">
        <Link className="home-product-category" to={`/products?category=${encodeURIComponent(item.item_group || '')}`}>{item.item_group || t(content.category_label_en, content.category_label_ar, 'Featured')}</Link>
        <h3><Link to={`/products/${encodeURIComponent(item.item_code)}`}>{item.item_name}</Link></h3>
        <div className="product-rating" aria-label={t('Product rating', 'تقييم المنتج')}><span>★★★★★</span><small>({item.review_count || 0})</small></div>
        <div className="home-product-footer">
          <div className="home-product-price">
            {price > 0 ? <><strong>{price.toFixed(2)} {item.currency || ''}</strong>{oldPrice > price && <del>{oldPrice.toFixed(2)} {item.currency || ''}</del>}</> : <strong>{t('On request', 'حسب الطلب')}</strong>}
          </div>
          <button type="button" className="add-product-button" onClick={() => onAdd(item)} disabled={isUnavailable}>
            <PlusIcon />
            <span>{isUnavailable ? t('Unavailable', 'غير متوفر') : t(content.add_to_cart_text_en, content.add_to_cart_text_ar, 'Add')}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

function SectionHeading({ title, subtitle, link, linkLabel, isRtl }) {
  return <div className="home-section-heading">
    <div><span className="section-kicker">{isRtl ? 'مختارات المتجر' : 'Store selection'}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    {link && <Link to={link} className="section-view-all">{linkLabel}<ArrowIcon /></Link>}
  </div>
}

export default function Landing() {
  const { content, loading, error } = useContent()
  const { lang, isRtl } = useLanguage()
  const { addItem } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fallbackItems, setFallbackItems] = useState([])
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const banners = content?.banners || []
  const categories = content?.featured_categories || []
  const configuredSections = content?.landing_sections || []
  const trustBadges = content?.trust_badges || []
  const testimonials = content?.testimonials || []

  useEffect(() => {
    if (banners.length <= 1) return undefined
    const timer = setInterval(() => setCurrentSlide((slide) => (slide + 1) % banners.length), 5500)
    return () => clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    if (configuredSections.length > 0) return undefined
    let mounted = true
    getCatalog({ page: 1, pageSize: 8 }).then((result) => {
      if (mounted) setFallbackItems(result?.items || [])
    }).catch(() => {})
    return () => { mounted = false }
  }, [configuredSections.length])

  const sections = useMemo(() => {
    if (configuredSections.length > 0) return configuredSections
    return fallbackItems.length ? [{ title_en: 'New arrivals', title_ar: 'وصل حديثاً', link_url: '/products', items: fallbackItems }] : []
  }, [configuredSections, fallbackItems])

  const hero = banners[currentSlide]
  const siteName = t(content?.site_name_en, content?.site_name_ar, content?.site_name || 'Sync Webshop')
  const heroTitle = hero ? t(hero.title, hero.title_ar) : t(content?.hero_quote_en, content?.hero_quote_ar, `${siteName}, made for everyday living.`)
  const heroSubtitle = hero ? t(hero.subtitle, hero.subtitle_ar) : t(content?.tagline_en, content?.tagline_ar, 'Discover useful products, fair prices, and a smoother way to shop.')

  if (loading && !content) return <div className="landing-loading"><div className="loading-block loading-hero" /><div className="container loading-line" /><div className="container loading-grid" /></div>

  return (
    <div className={`landing-page ${isRtl ? 'rtl' : 'ltr'}`}>
      <section className="home-hero" style={hero?.image ? { backgroundImage: `linear-gradient(90deg, rgba(10, 39, 34, 0.9) 0%, rgba(10, 39, 34, 0.58) 48%, rgba(10, 39, 34, 0.12) 100%), url(${hero.image})` } : undefined}>
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">{t('Thoughtfully selected', 'مختارات بعناية')}</span>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
            <div className="hero-actions">
              <Link className="primary-button" to={hero?.link_url || '/products'}>{t(content?.shop_now_text_en, content?.shop_now_text_ar, 'Shop now')} <ArrowIcon /></Link>
              <Link className="text-button" to="/products">{t('Explore all products', 'اكتشف كل المنتجات')} <ArrowIcon /></Link>
            </div>
          </div>
          <div className="hero-note"><span className="hero-note-line" /><span>{t('Simple choices. Better everyday.', 'اختيارات بسيطة. يوم أفضل.')}</span></div>
        </div>
        {banners.length > 1 && <div className="hero-controls container"><div className="hero-dots">{banners.map((_, index) => <button key={index} type="button" className={index === currentSlide ? 'active' : ''} onClick={() => setCurrentSlide(index)} aria-label={`${t('Slide', 'الشريحة')} ${index + 1}`} />)}</div><div className="hero-counter"><strong>{String(currentSlide + 1).padStart(2, '0')}</strong><span>/ {String(banners.length).padStart(2, '0')}</span></div></div>}
      </section>

      {categories.length > 0 && <section className="home-section categories-section container">
        <SectionHeading title={t(content?.best_categories_text_en, content?.best_categories_text_ar, 'Shop by category')} subtitle={t('Start with a collection curated for the way you shop.', 'ابدأ بتشكيلة مختارة تناسب طريقتك في التسوق.')} link="/products" linkLabel={t(content?.view_all_text_en, content?.view_all_text_ar, 'View all')} isRtl={isArabic} />
        <div className="category-rail">{categories.slice(0, 8).map((category, index) => <Link key={`${category.item_group}-${index}`} to={`/products?category=${encodeURIComponent(category.item_group)}`} className="category-tile"><div className="category-tile-image">{category.image ? <img src={category.image} alt={t(category.label_en, category.label_ar, category.item_group)} loading="lazy" /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><div className="category-tile-copy"><h3>{t(category.label_en, category.label_ar, category.item_group)}</h3><span>{t('Explore collection', 'استكشف المجموعة')} <ArrowIcon /></span></div></Link>)}</div>
      </section>}

      {sections.map((section, index) => <section className={`home-section product-section ${index % 2 ? 'soft-section' : ''}`} key={`${section.title_en || section.title_ar}-${index}`}><div className="container"><SectionHeading title={t(section.title_en, section.title_ar, index === 0 ? 'New arrivals' : 'Featured products')} subtitle={t(section.subtitle_en, section.subtitle_ar)} link={section.link_url || '/products'} linkLabel={t(content?.view_all_text_en, content?.view_all_text_ar, 'View all')} isRtl={isArabic} /><div className="home-product-grid">{(section.items || []).slice(0, 8).map((item) => <ProductCard key={item.item_code} item={item} content={content} lang={lang} onAdd={addItem} />)}</div></div></section>)}

      {trustBadges.length > 0 && <section className="benefits-section"><div className="container benefits-grid">{trustBadges.slice(0, 4).map((badge, index) => <div className="benefit-item" key={`${badge.label_en}-${index}`}><div className="benefit-icon">{badge.icon ? <span dangerouslySetInnerHTML={{ __html: badge.icon }} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><div><h3>{t(badge.label_en, badge.label_ar)}</h3><p>{t(badge.description_en, badge.description_ar)}</p></div></div>)}</div></section>}

      {testimonials.length > 0 && <section className="home-section testimonials-section container"><SectionHeading title={t('What our customers say', 'ماذا يقول عملاؤنا')} subtitle={t('Real experiences from shoppers who choose Sync Webshop.', 'تجارب حقيقية من عملاء يختارون متجر سينك.')} isRtl={isArabic} /><div className="testimonial-grid">{testimonials.slice(0, 3).map((testimonial, index) => <article className="testimonial-card" key={`${testimonial.author}-${index}`}><div className="testimonial-stars">★★★★★</div><blockquote>“{t(testimonial.quote_en, testimonial.quote_ar)}”</blockquote><footer><strong>{testimonial.author}</strong><span>{testimonial.author_title}</span></footer></article>)}</div></section>}

      {error && <div className="container api-notice" role="status">{t('Some live content is temporarily unavailable. Showing the latest available storefront settings.', 'بعض المحتوى المباشر غير متاح مؤقتاً. نعرض أحدث إعدادات المتجر المتاحة.')}</div>}
    </div>
  )
}
