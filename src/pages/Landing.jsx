import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import './Landing.css'

export default function Landing() {
  const { content, loading } = useContent()
  const { lang } = useLanguage()
  const { addItem } = useCart()
  const [currentSlide, setCurrentSlide] = useState(0)

  const banners = content?.banners || []
  const categories = content?.featured_categories || []
  const trustBadges = content?.trust_badges || []
  const landingSections = content?.landing_sections || []

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length)
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="skeleton hero-skeleton"></div>
        <div className="container">
          <div className="skeleton title-skeleton"></div>
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton card-skeleton"></div>)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-page">
      {/* Hero Slider */}
      {banners.length > 0 && (
        <section className="hero-section">
          <div className="hero-slider">
            {banners.map((banner, idx) => (
              <div
                key={idx}
                className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${banner.image})` }}
              >
                <div className="container">
                  <div className="hero-content">
                    <h1>{banner.title}</h1>
                    <p>{banner.subtitle}</p>
                    {banner.link_url && (
                      <Link to={banner.link_url} className="btn btn-primary">
                        {lang === 'ar' ? (content?.shop_now_text_ar || 'تسوق الآن') : (content?.shop_now_text_en || 'Shop Now')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {banners.length > 1 && (
              <>
                <button className="slider-nav prev" onClick={handlePrevSlide}>‹</button>
                <button className="slider-nav next" onClick={handleNextSlide}>›</button>
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
              {lang === 'ar' ? (content?.best_categories_text_ar || 'أفضل الفئات') : (content?.best_categories_text_en || 'Best Categories')}
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

      {/* Dynamic Landing Sections */}
      {landingSections.map((section, idx) => (
        <section key={idx} className="landing-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                {lang === 'ar' ? (section.title_ar || section.title_en) : section.title_en}
              </h2>
              {section.link_url && (
                <Link to={section.link_url} className="view-all">
                  {lang === 'ar' ? (content?.view_all_text_ar || 'عرض الكل') : (content?.view_all_text_en || 'View All')}
                </Link>
              )}
            </div>
            <div className="products-grid">
              {section.items.map((item) => (
                <div key={item.item_code} className="product-card">
                  <div className="product-badge">{lang === 'ar' ? (content?.new_badge_text_ar || 'جديد') : (content?.new_badge_text_en || 'New')}</div>
                  <Link to={`/products/${encodeURIComponent(item.item_code)}`} className="product-img-link">
                    {item.image ? (
                      <img src={item.image} alt={item.item_name} />
                    ) : (
                      <div className="no-image-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                    )}
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
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addItem(item)}
                      >
                        {lang === 'ar' ? (content?.add_to_cart_text_ar || 'أضف') : (content?.add_to_cart_text_en || 'Add')}
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
