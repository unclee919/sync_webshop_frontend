import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContent } from '../api/client'
import { useTheme } from '../theme/ThemeProvider'
import RoastStamp from '../components/RoastStamp'
import './Landing.css'

// Fallback copy for a fresh install where Webshop Content Settings hasn't
// been filled in yet, so the page still reads intentionally rather than
// looking broken. Replace by filling in Webshop Content Settings in the
// ERPNext desk - nothing here is hardcoded into the component logic.
const FALLBACK = {
  site_name: 'Dpono',
  tagline_en: 'Small-batch roasted, sourced with intent.',
  hero_quote_en:
    'Bright and syrupy with notes of stone fruit and brown sugar - our current single origin, roasted this week.',
  about_text_en:
    'Dpono roasts in small batches and ships within days of the roast date, so what arrives at your door still smells like the roastery. We work directly with growers we can name, and we say so on every bag.',
  footer_text_en: 'Roasted fresh. Shipped fast.',
}

export default function Landing() {
  const theme = useTheme()
  const [content, setContent] = useState(null)

  useEffect(() => {
    getContent().then(setContent)
  }, [])

  const c = content || {}
  const siteName = c.site_name || FALLBACK.site_name
  const taglineEn = c.tagline_en || FALLBACK.tagline_en
  const heroQuoteEn = c.hero_quote_en || FALLBACK.hero_quote_en
  const heroQuoteAr = c.hero_quote_ar
  const aboutEn = c.about_text_en || FALLBACK.about_text_en
  const footerEn = c.footer_text_en || FALLBACK.footer_text_en
  const banners = c.banners || []
  const categories = c.featured_categories || []
  const testimonials = c.testimonials || []

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div>
          <p className="hero-eyebrow">{siteName}</p>
          <h1 className="hero-title">{taglineEn}</h1>
          {c.tagline_ar && <p className="hero-tagline-ar">{c.tagline_ar}</p>}

          <div className="tasting-note">
            <span className="tasting-note-label">Roaster's note</span>
            <p>{heroQuoteEn}</p>
            {heroQuoteAr && (
              <p className="testimonial-quote-ar" style={{ marginTop: '0.5rem' }}>
                {heroQuoteAr}
              </p>
            )}
          </div>

          <Link to="/products" className="hero-cta">
            Shop the current roast →
          </Link>
        </div>

        <div className="hero-image-wrap">
          {theme.hero_background_image && (
            <img src={theme.hero_background_image} alt="" />
          )}
          <RoastStamp label={siteName.slice(0, 8)} size={96} className="hero-stamp" style={{ position: 'absolute' }} />
        </div>
      </section>

      {/* Featured categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="section-heading">Shop by category</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.item_group}
                to={`/products?category=${encodeURIComponent(cat.item_group)}`}
                className="category-card"
              >
                {cat.image && <img src={cat.image} alt="" />}
                <RoastStamp label="pick" size={44} style={{ position: 'absolute' }} className="category-card-stamp" />
                <span className="category-card-label">{cat.label_en}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Banners */}
      {banners.length > 0 && (
        <section>
          <h2 className="section-heading">Right now</h2>
          <div className="banner-strip">
            {banners.map((b, i) => (
              <a key={i} href={b.link_url || '#'} className="banner-card">
                {b.image && <img src={b.image} alt="" />}
                <span className="banner-card-text">
                  <strong>{b.title}</strong>
                  {b.subtitle && <span>{b.subtitle}</span>}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      <section className="about-section">
        <div className="about-inner">
          <h2 className="section-heading">About {siteName}</h2>
          {c.about_text_en ? (
            <div dangerouslySetInnerHTML={{ __html: c.about_text_en }} />
          ) : (
            <p>{aboutEn}</p>
          )}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section>
          <h2 className="section-heading">What people are saying</h2>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <RoastStamp label="says" size={40} className="testimonial-stamp" />
                <blockquote>{t.quote_en}</blockquote>
                {t.quote_ar && <p className="testimonial-quote-ar">{t.quote_ar}</p>}
                <span className="testimonial-author">{t.author}</span>
                {t.author_title && (
                  <span className="testimonial-author-title">{t.author_title}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="landing-footer" style={{ padding: '2rem 6vw' }}>
        <span>{footerEn}</span>
        <span>
          © {new Date().getFullYear()} {siteName}
        </span>
      </footer>
    </div>
  )
}
