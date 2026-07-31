import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './Landing.css'

export default function Landing() {
  const { lang, isRtl } = useLanguage()
  const { content, loading } = useContent()
  const [currentSlide, setCurrentSlide] = useState(0)

  if (loading) return <div className="loading-state container">Loading...</div>
  if (!content) return null

  const c = content
  const banners = c.banners || []
  const categories = c.featured_categories || []
  const trustBadges = c.trust_badges || []
  const landingSections = c.landing_sections || []

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (index) => {
    setCurrentSlide(index)
  }

  const theme = content?.theme || {}
  const heroHeight = theme?.dimensions?.hero_height ? `${theme.dimensions.hero_height}px` : '450px';
  const heroWidth = theme?.dimensions?.hero_width ? `${theme.dimensions.hero_width}px` : '100%';

  return (
    <div className={`landing ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Hero Section / Slider */}
      {banners.length > 0 && (
        <section className="hero-slider">
          <div className="slider-wrapper" style={{ height: heroHeight, maxWidth: heroWidth }}>
            <div className="slider-container" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {banners.map((b, i) => (
                <div key={i} className="slide" style={{ height: heroHeight }}>
                  <img src={b.image} alt={b.title} />
                  <div className="slide-content">
                    <div className="container">
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
              ))}
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button className="slider-arrow slider-arrow-prev" onClick={handlePrevSlide} aria-label="Previous slide">
                  ‹
                </button>
                <button className="slider-arrow slider-arrow-next" onClick={handleNextSlide} aria-label="Next slide">
                  ›
                </button>
              </>
            )}

            {/* Dots Navigation */}
            {banners.length > 1 && (
              <div className="slider-dots">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    className={`slider-dot ${i === currentSlide ? 'active' : ''}`}
                    onClick={() => handleDotClick(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="section-categories">
          <div className="container">
            <h2 className="section-title">
              {lang === 'ar' ? 'أفضل الفئات' : 'Best Categories'}
            </h2>
            <div className="categories-grid">
              {categories.map((cat, i) => (
                <Link key={i} to={`/products?category=${encodeURIComponent(cat.item_group)}`} className="category-item">
                  <div className="category-image">
                    <img src={cat.image} alt={cat.label_en} />
                  </div>
                  <span className="category-label">
                    {lang === 'ar' ? (cat.label_ar || cat.label_en) : cat.label_en}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Landing Sections */}
      {landingSections.map((section, idx) => (
        <section key={idx} className="landing-section">
          <div className="container">
            <h2 className="section-title">
              {lang === 'ar' ? (section.title_ar || section.title_en) : section.title_en}
            </h2>
            {(section.subtitle_en || section.subtitle_ar) && (
              <p className="section-subtitle">
                {lang === 'ar' ? (section.subtitle_ar || section.subtitle_en) : section.subtitle_en}
              </p>
            )}
            <div className="landing-items-grid">
              {section.items.map((item) => (
                <div key={item.item_code} className="product-card">
                  <Link to={`/products/${encodeURIComponent(item.item_code)}`}>
                    <div className="product-image">
                      {item.image && <img src={item.image} alt={item.item_name} />}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{item.item_name}</h3>
                      <div className="product-price">
                        {item.price.toFixed(2)} {item.currency}
                      </div>
                    </div>
                  </Link>
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
                <div key={i} className="trust-item">
                  <div className="trust-icon">{badge.icon}</div>
                  <div className="trust-text">
                    <h3>{lang === 'ar' ? (badge.label_ar || badge.label_en) : badge.label_en}</h3>
                    <p>{lang === 'ar' ? (badge.description_ar || badge.description_en) : badge.description_en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="section-about">
        <div className="container">
          <h2 className="section-title">{lang === 'ar' ? `عن ${c.site_name}` : `About ${c.site_name}`}</h2>
          <div 
            className="about-content"
            dangerouslySetInnerHTML={{ __html: lang === 'ar' ? (c.about_text_ar || c.about_text_en) : c.about_text_en }} 
          />
        </div>
      </section>
    </div>
  )
}
