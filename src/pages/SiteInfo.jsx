import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './SiteInfo.css'

export default function SiteInfo() {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  return <div className={`info-page container ${isRtl ? 'rtl' : 'ltr'}`}>
    <div className="breadcrumb"><Link to="/">{t('Home', 'الرئيسية')}</Link><span>/</span><span>{t('Contact us', 'تواصل معنا')}</span></div>
    <div className="info-card"><span className="section-kicker">{t('We are here to help', 'نحن هنا للمساعدة')}</span><h1>{t('Contact Sync Webshop', 'تواصل مع متجر سينك')}</h1><div className="info-copy" dangerouslySetInnerHTML={{ __html: t(content?.about_text_en, content?.about_text_ar, 'Tell us what you need and our team will help you find the right products and delivery option.') }} /><div className="info-details">{content?.phone_number && <a href={`tel:${content.phone_number}`}><strong>{t('Call us', 'اتصل بنا')}</strong><span>{content.phone_number}</span></a>}{content?.email_address && <a href={`mailto:${content.email_address}`}><strong>{t('Email us', 'راسلنا')}</strong><span>{content.email_address}</span></a>}{(content?.contact_address_en || content?.contact_address_ar) && <div><strong>{t('Visit us', 'عنواننا')}</strong><span>{t(content.contact_address_en, content.contact_address_ar)}</span></div>}</div><Link className="primary-button" to="/products">{t('Continue shopping', 'تابع التسوق')}</Link></div>
  </div>
}
