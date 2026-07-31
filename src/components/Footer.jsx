import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useContent } from '../context/ContentContext'
import './Footer.css'

export default function Footer() {
  const { lang, isRtl } = useLanguage()
  const { content } = useContent()
  
  if (!content) return null

  const c = content
  const socialLinks = c.social_links || []
  const footer = c.footer_settings || {}
  const columns = footer.columns || []

  return (
    <footer className={`site-footer ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-col about-col">
            {footer.footer_logo ? (
              <img src={footer.footer_logo} alt={c.site_name} className="footer-logo" />
            ) : (
              <h3 className="footer-site-name">{c.site_name}</h3>
            )}
            <p className="footer-tagline">
              {lang === 'ar' ? (c.tagline_ar || c.tagline_en) : c.tagline_en}
            </p>
            <div className="footer-contact">
              {c.phone_number && (
                <div className="contact-item">
                  <span className="icon">📞</span>
                  <span>{c.phone_number}</span>
                </div>
              )}
              {c.email_address && (
                <div className="contact-item">
                  <span className="icon">✉️</span>
                  <span>{c.email_address}</span>
                </div>
              )}
              {(c.contact_address_en || c.contact_address_ar) && (
                <div className="contact-item">
                  <span className="icon">📍</span>
                  <span>{lang === 'ar' ? (c.contact_address_ar || c.contact_address_en) : c.contact_address_en}</span>
                </div>
              )}
            </div>
          </div>

          {columns.length > 0 ? (
            columns.map((col, idx) => (
              <div key={idx} className="footer-col">
                <h3 className="footer-title">{lang === 'ar' ? col.title_ar : col.title_en}</h3>
                <ul className="footer-links">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.is_external ? (
                        <a href={link.link_url} target="_blank" rel="noopener noreferrer">
                          {lang === 'ar' ? (link.label_ar || link.label_en) : link.label_en}
                        </a>
                      ) : (
                        <Link to={link.link_url}>
                          {lang === 'ar' ? (link.label_ar || link.label_en) : link.label_en}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="footer-col links-col">
              <h3 className="footer-title">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
              <ul className="footer-links">
                <li><Link to="/">{lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}</Link></li>
                <li><Link to="/products">{lang === 'ar' ? 'المنتجات' : 'Products'}</Link></li>
                <li><Link to="/cart">{lang === 'ar' ? 'السلة' : 'Cart'}</Link></li>
                <li><Link to="/dashboard">{lang === 'ar' ? 'حسابي' : 'Account'}</Link></li>
                <li><Link to="/track">{lang === 'ar' ? 'تتبع الطلب' : 'Track Order'}</Link></li>
              </ul>
            </div>
          )}

          <div className="footer-col social-col">
            <h3 className="footer-title">{lang === 'ar' ? 'تابعنا' : 'Follow Us'}</h3>
            <div className="social-links">
              {socialLinks.map((link, i) => (
                <a key={i} href={link.link_url} target="_blank" rel="noopener noreferrer" className="social-link">
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            {lang === 'ar' 
              ? (footer.copyright_ar || `© ${new Date().getFullYear()} ${c.site_name}. جميع الحقوق محفوظة.`)
              : (footer.copyright_en || `© ${new Date().getFullYear()} ${c.site_name}. All rights reserved.`)
            }
          </div>
        </div>
      </div>
    </footer>
  )
}
