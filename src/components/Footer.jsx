import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './Footer.css'

export default function Footer() {
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()

  return (
    <footer className={`site-footer ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="container">
        <div className="footer-top">
          <div className="footer-col about-col">
            <h3 className="footer-title">{content?.site_name || 'Sync Webshop'}</h3>
            <p className="footer-tagline">
              {lang === 'ar' ? (content?.tagline_ar || content?.tagline_en) : content?.tagline_en}
            </p>
            <div className="contact-info">
              {content?.phone_number && <p>📞 {content.phone_number}</p>}
              {content?.email_address && <p>✉️ {content.email_address}</p>}
              {content && (lang === 'ar' ? content.contact_address_ar : content.contact_address_en)}
            </div>
          </div>

          <div className="footer-col links-col">
            <h3 className="footer-title">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
            <ul className="footer-links">
              <li><Link to="/">{lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}</Link></li>
              <li><Link to="/products">{lang === 'ar' ? 'المنتجات' : 'Products'}</Link></li>
              <li><Link to="/cart">{lang === 'ar' ? 'السلة' : 'Cart'}</Link></li>
              <li><Link to="/dashboard">{lang === 'ar' ? 'حسابي' : 'Account'}</Link></li>
            </ul>
          </div>

          <div className="footer-col social-col">
            <h3 className="footer-title">{lang === 'ar' ? 'تابعنا' : 'Follow Us'}</h3>
            <div className="social-links">
              {content?.social_links && content.social_links.map((link, i) => (
                <a key={i} href={link.link_url} target="_blank" rel="noopener noreferrer" className="social-link">
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {content?.site_name || 'Sync Webshop'}. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  )
}
