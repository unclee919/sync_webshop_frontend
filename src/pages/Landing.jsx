import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './Landing.css'

export default function Landing() {
  const { lang, isRtl } = useLanguage()
  const { content, loading } = useContent()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!content?.banners?.length) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === content.banners.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [content?.banners])

  if (loading) return <div className="loading-state container">Loading...</div>
  if (!content) return null

  const c = content
  const banners = c.banners || c.hero_slides || []
  const categories = c.featured_categories || []
  const trustBadges = c.trust_badges || []
  const landingSections = c.landing_sections || []

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  const theme = content?.theme || {}
  const heroHeight = theme?.dimensions?.hero_height ? `${theme.dimensions.hero_height}px` : '500px';

  return (
    <div className={`landing ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Hero Section / Slider */}
      {banners.length > 0 && (
        <section className="hero-slider">
          <div className="slider-wrapper" style={{ height: heroHeight }}>
            <div className="slider-container" style={{ transform: `translateX(${isRtl ? currentSlide * 100 : -currentSlide * 100}%)` }}>
              {banners.map((b, i) => (
                <div key={i} className="slide" style={{ height: heroHeight }}>
                    <img src={b.image} alt={b.title} loading="lazy" />
                  <div className="slide-content">
                    <div className="container">
                      <div className="slide-text-box">
                        <h2>{b.title}</h2>
                        <p>{b.subtitle}</p>
                        {b.link_url && (
                          <Link to={b.link_url} className="btn-primary">
                            {lang === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {banners.length > 1 && (
              <>
                <button className="slider-arrow slider-arrow-prev" onClick={handlePrevSlide}>‹</button>
                <button className="slider-arrow slider-arrow-next" onClick={handleNextSlide}>›</button>
                <div className="slider-dots">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Categories Grid */}
      {categories.length > 0 && (
        <section className="section-categories">
          <div className="container">
            <h2 className="section-title">
              {lang === 'ar' ? 'أفضل الفئات' : 'Best Categories'}
            </h2>
            <div className="categories-grid">
              {categories.map((cat, i) => (
                <Link key={i} to={`/products?category=${encodeURIComponent(cat.item_group)}`} className="category-card">
                  <div className="category-img-wrapper">
                    <img src={cat.image} alt={cat.label_en} />
                  </div>
                  <div className="category-info">
                    <h4 className="category-name">
                      {lang === 'ar' ? (cat.label_ar || cat.label_en) : cat.label_en}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Landing Sections (Product Grids) */}
      {landingSections.map((section, idx) => (
        <section key={idx} className="landing-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                {lang === 'ar' ? (section.title_ar || section.title_en) : section.title_en}
              </h2>
              {section.link_url && (
                <Link to={section.link_url} className="view-all">
                  {lang === 'ar' ? 'عرض الكل' : 'View All'}
                </Link>
              )}
            </div>
            <div className="products-grid">
              {section.items.map((item) => (
                <div key={item.item_code} className="product-card">
                  <div className="product-badge">{lang === 'ar' ? 'جديد' : 'New'}</div>
                  <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="product-img-link">
                    <img src={item.image} alt={item.item_name} />
                  </Link>
                  <div className="product-content">
                    <span className="product-cat">{item.item_group}</span>
                    <h3 className="product-title">
                      <Link to={`/products/${encodeURIComponent(item.item_code)}`}>{item.item_name}</Link>
                    </h3>
                    <div className="product-card-bottom">
                      <div className="product-price">
                        <span className="current-price">{(item.price || 0).toFixed(2)} {item.currency}</span>
                      </div>
                      <button className="add-to-cart-btn">
                        {lang === 'ar' ? 'أضف' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Trust Badges */}
      {trustBadges.length > 0 && (
        <section className="section-trust">
          <div className="container">
            <div className="trust-grid">
              {trustBadges.map((badge, i) => (
                <div key={i} className="trust-card">
                  <div className="trust-icon" dangerouslySetInnerHTML={{ __html: badge.icon }} />
                  <div className="trust-content">
                    <h3>{lang === 'ar' ? (badge.label_ar || badge.label_en) : badge.label_en}</h3>
                    <p>{lang === 'ar' ? (badge.description_ar || badge.description_en) : badge.description_en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
