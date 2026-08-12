import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './Footer.css'

function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg> }

export default function Footer() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  if (!content || content.footer_settings?.enabled === 0) return null

  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const footer = content.footer_settings || {}
  const columns = footer.columns || []
  const socialLinks = content.social_links || []
  const year = new Date().getFullYear()

  return <footer className={`site-footer ${isRtl ? 'rtl' : 'ltr'}`}>
    <div className="footer-main container">
      <div className="footer-brand-column">
        {footer.footer_logo ? <img className="footer-logo" src={footer.footer_logo} alt={content.site_name} /> : <div className="footer-brand-name">{t(content.site_name_en, content.site_name_ar, content.site_name)}</div>}
        <p>{t(content.footer_text_en, content.footer_text_ar, content.tagline_en || content.tagline_ar || 'A calmer way to discover the products you need.')}</p>
        <div className="footer-contact-list">
          {content.phone_number && <a href={`tel:${content.phone_number}`}><span>01</span>{content.phone_number}</a>}
          {content.email_address && <a href={`mailto:${content.email_address}`}><span>02</span>{content.email_address}</a>}
          {(content.contact_address_en || content.contact_address_ar) && <span><span>03</span>{t(content.contact_address_en, content.contact_address_ar)}</span>}
        </div>
      </div>

      <div className="footer-links-grid">
        {columns.length > 0 ? columns.slice(0, 4).map((column, index) => <div className="footer-link-column" key={`${column.title_en}-${index}`}><h3>{t(column.title_en, column.title_ar)}</h3><ul>{(column.links || []).map((link, linkIndex) => <li key={`${link.link_url}-${linkIndex}`}>{link.is_external ? <a href={link.link_url} target="_blank" rel="noreferrer">{t(link.label_en, link.label_ar)} <ArrowIcon /></a> : <Link to={link.link_url}>{t(link.label_en, link.label_ar)} <ArrowIcon /></Link>}</li>)}</ul></div>) : <div className="footer-link-column"><h3>{t('Explore', 'استكشف')}</h3><ul><li><Link to="/">{t('Home', 'الرئيسية')} <ArrowIcon /></Link></li><li><Link to="/products">{t('All products', 'كل المنتجات')} <ArrowIcon /></Link></li><li><Link to="/track">{t('Track order', 'تتبع الطلب')} <ArrowIcon /></Link></li><li><Link to="/features">{t('Why us', 'لماذا نحن')} <ArrowIcon /></Link></li></ul></div>}
        <div className="footer-link-column footer-social-column"><h3>{t('Follow along', 'تابعنا')}</h3><div className="footer-social-links">{socialLinks.length > 0 ? socialLinks.map((link, index) => <a key={`${link.platform}-${index}`} href={link.link_url} target="_blank" rel="noreferrer">{link.platform}</a>) : <span>{t('Social links can be managed from Frappe Desk.', 'يمكن إدارة روابط التواصل الاجتماعي من لوحة Frappe.')}</span>}</div></div>
      </div>
    </div>
    <div className="footer-bottom"><div className="container footer-bottom-inner"><span>{footer.copyright_en || footer.copyright_ar || `© ${year} ${content.site_name}. ${t('All rights reserved.', 'جميع الحقوق محفوظة.')}`}</span><span>{t('Designed for a better shopping experience.', 'مصمم لتجربة تسوق أفضل.')}</span></div></div>
  </footer>
}
