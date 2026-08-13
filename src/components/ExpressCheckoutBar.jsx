import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { trackEvent } from '../utils/analytics'
import './ExpressCheckoutBar.css'

export default function ExpressCheckoutBar() {
  const { items, total } = useCart()
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const navigate = useNavigate()
  const exp = content?.experience_settings || {}
  if (exp.express_checkout_enabled === 0 || !items.length) return null
  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => isArabic ? (ar || en || fallback) : (en || ar || fallback)
  const go = () => { trackEvent('express_checkout_open', { item_count: items.length, cart_total: total }); navigate('/checkout?express=1') }
  return <aside className={`express-checkout-bar ${isRtl ? 'rtl' : 'ltr'}`} aria-label={t(exp.express_checkout_title_en, exp.express_checkout_title_ar, 'Express checkout')}>
    <div className="express-checkout-copy"><span className="express-checkout-kicker">{isArabic ? 'تجربة سلسة' : 'White-glove flow'}</span><strong>{t(exp.express_checkout_title_en, exp.express_checkout_title_ar, 'A faster way to checkout')}</strong><small>{t(exp.express_checkout_subtitle_en, exp.express_checkout_subtitle_ar, 'Use your saved details and continue in one fluid step.')}</small></div>
    <button type="button" onClick={go}>{t(exp.express_checkout_cta_en, exp.express_checkout_cta_ar, 'Checkout faster')} <span aria-hidden="true">→</span></button>
  </aside>
}
