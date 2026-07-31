import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './Landing.css'

export default function Landing() {
  const { lang, isRtl } = useLanguage()
  const { content, loading } = useContent()

  if (loading) return <div className="loading-state container">Loading...</div>
  if (!content) return null

  const c = content
  const banners = c.banners || []
  const categories = c.featured_categories || []
  const trustBadges = c.trust_badges || []

  return (
    <div className={`landing ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Hero Section / Slider */}
      {banners.length > 0 && (
        <section className="hero-slider">
          <div className="slider-container">
            {banners.map((b, i) => (
              <div key={i} className="slide">
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
