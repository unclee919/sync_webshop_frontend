import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './Footer.css'

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>
}

function BrandMark() {
  return <span className="footer-brand-mark" aria-hidden="true"><span /></span>
}

function ContactIcon({ type }) {
  const paths = {
    phone: <><path d="M7.3 4.2 9.8 3l2 4.2-1.7 1.5a12.4 12.4 0 0 0 5.2 5.2l1.5-1.7 4.2 2-1.2 2.5c-.5 1.1-1.6 1.7-2.8 1.5-6.7-1-12-6.3-13-13-.2-1.2.4-2.3 1.3-3Z" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  }
  return <svg className="footer-contact-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[type]}</svg>
}

function SocialIcon({ platform }) {
  const normalized = String(platform || '').toLowerCase()
  if (normalized.includes('instagram')) return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r="1" className="social-icon-dot" /></svg>
  if (normalized.includes('facebook')) return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.8v8" /></svg>
  if (normalized.includes('tiktok')) return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4v10.1a3.5 3.5 0 1 1-3-3.5" /><path d="M14 4c.6 2.1 1.8 3.4 4 3.7" /></svg>
  return <span className="footer-social-fallback" aria-hidden="true">↗</span>
}

export default function Footer() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  if (!content || content.footer_settings?.enabled === 0) return null

  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const footer = content.footer_settings || {}
  const columns = footer.columns || []
  const socialLinks = content.social_links || []
  const dynamicPages = content.dynamic_pages || {}
  const dynamicLinks = [
    { key: 'about', path: '/about-us', enabled: dynamicPages.about_enabled !== 0, show: dynamicPages.about_show_in_nav !== 0, en: dynamicPages.about_label_en, ar: dynamicPages.about_label_ar },
    { key: 'policy', path: '/our-policy', enabled: dynamicPages.policy_enabled !== 0, show: dynamicPages.policy_show_in_nav !== 0, en: dynamicPages.policy_label_en, ar: dynamicPages.policy_label_ar },
    { key: 'articles', path: '/articles', enabled: dynamicPages.articles_enabled !== 0, show: dynamicPages.articles_show_in_nav !== 0, en: dynamicPages.articles_label_en, ar: dynamicPages.articles_label_ar },
    { key: 'qa', path: '/qa', enabled: dynamicPages.qa_enabled !== 0, show: dynamicPages.qa_show_in_nav !== 0, en: dynamicPages.qa_label_en, ar: dynamicPages.qa_label_ar },
  ].filter((link) => dynamicPages.enabled !== 0 && link.enabled && link.show)
  const siteName = t(content.site_name_en, content.site_name_ar, content.site_name || 'Sync')
  const footerDescription = t(content.footer_text_en, content.footer_text_ar, content.tagline_en || content.tagline_ar || 'A calmer way to discover the products you need.')
  const year = new Date().getFullYear()

  return <footer className={`site-footer ${isRtl ? 'rtl' : 'ltr'}`} aria-labelledby="footer-brand-title">
    <div className="footer-glow footer-glow-one" aria-hidden="true" />
    <div className="footer-glow footer-glow-two" aria-hidden="true" />
    <div className="footer-main container">
      <div className="footer-brand-column">
        <div className="footer-brand-lockup" id="footer-brand-title">
          {footer.footer_logo ? <img className="footer-logo" src={footer.footer_logo} alt={siteName} /> : <><BrandMark /><span className="footer-brand-name">{siteName}</span></>}
        </div>
        <span className="footer-eyebrow">{t('The considered edit', 'اختيارات مدروسة')}</span>
        <p className="footer-brand-description">{footerDescription}</p>
        <div className="footer-contact-heading">{t('Reach us directly', 'تواصل معنا مباشرة')}</div>
        <address className="footer-contact-list">
          {content.phone_number && <a href={`tel:${content.phone_number}`} aria-label={`${t('Call', 'اتصل')} ${content.phone_number}`}><ContactIcon type="phone" /><span><small>{t('Phone', 'الهاتف')}</small>{content.phone_number}</span></a>}
          {content.email_address && <a href={`mailto:${content.email_address}`} aria-label={`${t('Email', 'البريد الإلكتروني')} ${content.email_address}`}><ContactIcon type="email" /><span><small>{t('Email', 'البريد الإلكتروني')}</small>{content.email_address}</span></a>}
          {(content.contact_address_en || content.contact_address_ar) && <span><ContactIcon type="location" /><span><small>{t('Studio', 'المتجر')}</small>{t(content.contact_address_en, content.contact_address_ar)}</span></span>}
        </address>
      </div>

      <div className="footer-links-area">
        <nav className="footer-links-grid" aria-label={t('Footer navigation', 'التنقل في التذييل')}>
          {columns.length > 0 ? columns.slice(0, 4).map((column, index) => <div className="footer-link-column" key={`${column.title_en}-${index}`}><h2>{t(column.title_en, column.title_ar)}</h2><ul>{(column.links || []).map((link, linkIndex) => <li key={`${link.link_url}-${linkIndex}`}>{link.is_external ? <a href={link.link_url} target="_blank" rel="noreferrer">{t(link.label_en, link.label_ar)} <ArrowIcon /></a> : <Link to={link.link_url}>{t(link.label_en, link.label_ar)} <ArrowIcon /></Link>}</li>)}</ul></div>) : <div className="footer-link-column"><h2>{t('Explore', 'استكشف')}</h2><ul><li><Link to="/">{t('Home', 'الرئيسية')} <ArrowIcon /></Link></li><li><Link to="/products">{t('All products', 'كل المنتجات')} <ArrowIcon /></Link></li><li><Link to="/track">{t('Track order', 'تتبع الطلب')} <ArrowIcon /></Link></li><li><Link to="/features">{t('Why us', 'لماذا نحن')} <ArrowIcon /></Link></li></ul></div>}
          {dynamicLinks.length > 0 && <div className="footer-link-column"><h2>{t('Information', 'معلومات')}</h2><ul>{dynamicLinks.map((link) => <li key={link.key}><Link to={link.path}>{t(link.en, link.ar)} <ArrowIcon /></Link></li>)}</ul></div>}
        </nav>
        <div className="footer-social-panel">
          <div><span className="footer-eyebrow">{t('Stay in the loop', 'ابقَ على اطلاع')}</span><h2>{t('Follow along', 'تابعنا')}</h2></div>
          <div className="footer-social-links" aria-label={t('Social media links', 'روابط التواصل الاجتماعي')}>
            {socialLinks.length > 0 ? socialLinks.map((link, index) => <a key={`${link.platform}-${index}`} href={link.link_url} target="_blank" rel="noreferrer" aria-label={`${t('Visit us on', 'زرنا على')} ${link.platform}`}><SocialIcon platform={link.platform} /><span>{link.platform}</span><ArrowIcon /></a>) : <span className="footer-social-empty">{t('Social links can be managed from Frappe Desk.', 'يمكن إدارة روابط التواصل الاجتماعي من لوحة Frappe.')}</span>}
          </div>
        </div>
      </div>
    </div>
    <div className="footer-bottom"><div className="container footer-bottom-inner"><span>{footer.copyright_en || footer.copyright_ar || `© ${year} ${siteName}. ${t('All rights reserved.', 'جميع الحقوق محفوظة.')}`}</span><span>{t('Designed for a better shopping experience.', 'مصمم لتجربة تسوق أفضل.')}</span></div></div>
  </footer>
}
