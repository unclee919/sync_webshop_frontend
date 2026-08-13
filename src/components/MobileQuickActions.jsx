import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './MobileQuickActions.css'

export default function MobileQuickActions({ onOpenCart }) {
  const { content } = useContent()
  const { lang } = useLanguage()
  const { count } = useCart()
  const navigate = useNavigate()
  const [recentOpen, setRecentOpen] = useState(false)
  const isArabic = lang === 'ar'
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  const recentCodes = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sync_webshop_recently_viewed') || '[]') } catch { return [] }
  }, [recentOpen])
  if (content?.mobile_quick_actions_enabled === 0) return null
  return <>
    <nav className="mobile-quick-actions" aria-label={t('Quick actions', 'إجراءات سريعة')}>
      <Link to="/products" className="mobile-quick-action"><span>⌕</span><small>{t('Search', 'بحث')}</small></Link>
      <button type="button" className={`mobile-quick-action ${recentOpen ? 'active' : ''}`} onClick={() => setRecentOpen((open) => !open)}><span>◷</span><small>{t('Recent', 'الأخيرة')}</small></button>
      <Link to="/wishlist" className="mobile-quick-action"><span>♡</span><small>{t('Saved', 'المفضلة')}</small></Link>
      <button type="button" className="mobile-quick-action" onClick={() => onOpenCart?.()}><span className="quick-cart-icon">▱{count > 0 && <b>{count}</b>}</span><small>{t('Bag', 'السلة')}</small></button>
    </nav>
    {recentOpen && <div className="mobile-recent-popover"><div><strong>{t('Recently viewed', 'شوهدت مؤخراً')}</strong><button type="button" onClick={() => setRecentOpen(false)}>×</button></div>{recentCodes.length ? <p>{t(`${recentCodes.length} product${recentCodes.length === 1 ? '' : 's'} ready to revisit.`, `لديك ${recentCodes.length} منتجات للعودة إليها.`)} <button type="button" onClick={() => { setRecentOpen(false); navigate('/products') }}>{t('Browse', 'تصفح')}</button></p> : <p>{t('Your recent picks will appear here.', 'ستظهر اختياراتك الأخيرة هنا.')}</p>}</div>}
  </>
}
