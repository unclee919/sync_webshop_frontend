import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './Features.css'

export default function Features() {
  const { lang, isRtl } = useLanguage()
  const { content, loading } = useContent()
  const isArabic = lang === 'ar'
  const trustBadges = (content?.trust_badges || []).slice(0, 8)
  const pageTitle = isArabic ? (content?.why_us_text_ar || 'لماذا نحن') : (content?.why_us_text_en || 'Why shop with us')
  const kicker = isArabic ? 'تجربة تسوق بثقة' : 'A considered experience'
  const intro = isArabic
    ? 'اكتشف الأسباب التي تجعل كل طلب من سينك أكثر وضوحاً وراحة واهتماماً.'
    : 'Discover the thoughtful details that make every Sync order clearer, easier, and more reassuring.'
  const shopLabel = isArabic ? (content?.shop_now_text_ar || 'تسوق الآن') : (content?.shop_now_text_en || 'Shop now')

  return (
    <div className={`features-page container ${isRtl ? 'rtl' : 'ltr'}`}>
      <header className="features-hero">
        <span className="features-kicker">{kicker}</span>
        <h1>{pageTitle}</h1>
        <p className="features-intro">{intro}</p>
      </header>

      <section className="features-grid" aria-label={pageTitle}>
        {trustBadges.map((badge, index) => (
          <article className="feature-card" key={`${badge.label_en || badge.label_ar || 'trust'}-${index}`}>
            <div className="feature-card-topline">
              <span className="feature-order">{String(index + 1).padStart(2, '0')}</span>
              <div className="feature-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: badge.icon || '' }} />
            </div>
            <div className="feature-card-copy">
              <h2>{isArabic ? (badge.label_ar || badge.label_en) : (badge.label_en || badge.label_ar)}</h2>
              <p>{isArabic ? (badge.description_ar || badge.description_en) : (badge.description_en || badge.description_ar)}</p>
            </div>
          </article>
        ))}
      </section>

      {!loading && trustBadges.length === 0 && (
        <p className="features-empty">{isArabic ? 'سيتم تحديث مزايا المتجر قريباً.' : 'Our store benefits will be updated soon.'}</p>
      )}

      <div className="features-cta-wrap">
        <Link className="features-cta" to="/products">{shopLabel}<span aria-hidden="true">→</span></Link>
      </div>
    </div>
  )
}
