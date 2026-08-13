import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import './UnifiedFloatingActions.css'

export default function UnifiedFloatingActions({ onOpenCart }) {
  const { content } = useContent()
  const { lang, isRtl } = useLanguage()
  const { count } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('sync_webshop_theme_mode') === 'dark')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const isArabic = lang === 'ar'
  const t = (en, ar) => isArabic ? (ar || en) : (en || ar)
  const whatsappNumber = content?.whatsapp_number
  const whatsappMessage = content?.whatsapp_message || ''
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}` : null

  useEffect(() => {
    function handleScroll() { setShowBackToTop(window.scrollY > 300) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('sync_webshop_theme_mode', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('sync_webshop_theme_mode', 'light')
    }
  }, [isDark])

  function toggleTheme() { setIsDark((current) => !current) }
  function openAssistant() {
    window.dispatchEvent(new CustomEvent('sync:open-ai-chat'))
    setOpen(false)
  }
  function goToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setOpen(false)
  }

  if (content?.mobile_quick_actions_enabled === 0) return null

  return (
    <div className={`unified-floating-actions ${isRtl ? 'rtl' : 'ltr'} ${open ? 'is-open' : ''}`}>
      {open && <button type="button" className="unified-floating-backdrop" aria-label={t('Close quick actions', 'إغلاق الإجراءات السريعة')} onClick={() => setOpen(false)} />}
      <div className="unified-floating-items" aria-label={t('Quick actions', 'إجراءات سريعة')}>
        <Link to="/products" className="unified-floating-item" onClick={() => setOpen(false)}><span aria-hidden="true">⌕</span><small>{t('Search', 'بحث')}</small></Link>
        <Link to="/wishlist" className="unified-floating-item" onClick={() => setOpen(false)}><span aria-hidden="true">♡</span><small>{t('Saved', 'المفضلة')}</small></Link>
        <button type="button" className="unified-floating-item" onClick={() => { onOpenCart?.(); setOpen(false) }}><span aria-hidden="true">▱{count > 0 && <b>{count}</b>}</span><small>{t('Bag', 'السلة')}</small></button>
        <button type="button" className="unified-floating-item" onClick={openAssistant}><span aria-hidden="true">✦</span><small>{t('AI help', 'مساعدة ذكية')}</small></button>
        {whatsappUrl && content?.show_whatsapp_button && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="unified-floating-item" onClick={() => setOpen(false)}><span aria-hidden="true">◉</span><small>{t('WhatsApp', 'واتساب')}</small></a>}
        <button type="button" className="unified-floating-item" onClick={toggleTheme}><span aria-hidden="true">{isDark ? '☀' : '☾'}</span><small>{isDark ? t('Light', 'مضيء') : t('Dark', 'داكن')}</small></button>
        {showBackToTop && content?.show_back_to_top && <button type="button" className="unified-floating-item" onClick={goToTop}><span aria-hidden="true">↑</span><small>{t('Top', 'أعلى')}</small></button>}
      </div>
      <button type="button" className="unified-floating-trigger" aria-expanded={open} aria-label={open ? t('Close quick actions', 'إغلاق الإجراءات السريعة') : t('Open quick actions', 'فتح الإجراءات السريعة')} onClick={() => setOpen((current) => !current)}><span aria-hidden="true">{open ? '×' : '⋮'}</span><small>{t('Menu', 'القائمة')}</small></button>
    </div>
  )
}
