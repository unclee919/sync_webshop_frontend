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
  const uiCopy = content?.copy?.ui || {}
  const t = (en, ar, fallback = '') => isArabic ? (ar || en || fallback) : (en || ar || fallback)
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
      {open && <button type="button" className="unified-floating-backdrop" aria-label={t(uiCopy.close_quick_actions_en, uiCopy.close_quick_actions_ar, 'Close quick actions')} onClick={() => setOpen(false)} />}
      <div className="unified-floating-items" aria-label={t(uiCopy.quick_actions_en, uiCopy.quick_actions_ar, 'Quick actions')}>
        <Link to="/products" className="unified-floating-item" onClick={() => setOpen(false)}><span aria-hidden="true">⌕</span><small>{t(uiCopy.search_en, uiCopy.search_ar, 'Search')}</small></Link>
        <Link to="/wishlist" className="unified-floating-item" onClick={() => setOpen(false)}><span aria-hidden="true">♡</span><small>{t(uiCopy.saved_en, uiCopy.saved_ar, 'Saved')}</small></Link>
        <button type="button" className="unified-floating-item" onClick={() => { onOpenCart?.(); setOpen(false) }}><span aria-hidden="true">▱{count > 0 && <b>{count}</b>}</span><small>{t(uiCopy.bag_en, uiCopy.bag_ar, 'Bag')}</small></button>
        <button type="button" className="unified-floating-item" onClick={openAssistant}><span aria-hidden="true">✦</span><small>{t(uiCopy.ai_help_en, uiCopy.ai_help_ar, 'AI help')}</small></button>
        {whatsappUrl && content?.show_whatsapp_button && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="unified-floating-item" onClick={() => setOpen(false)}><span aria-hidden="true">◉</span><small>{t(uiCopy.whatsapp_en, uiCopy.whatsapp_ar, 'WhatsApp')}</small></a>}
        <button type="button" className="unified-floating-item" onClick={toggleTheme}><span aria-hidden="true">{isDark ? '☀' : '☾'}</span><small>{isDark ? t(uiCopy.light_en, uiCopy.light_ar, 'Light') : t(uiCopy.dark_en, uiCopy.dark_ar, 'Dark')}</small></button>
        {showBackToTop && content?.show_back_to_top && <button type="button" className="unified-floating-item" onClick={goToTop}><span aria-hidden="true">↑</span><small>{t(uiCopy.top_en, uiCopy.top_ar, 'Top')}</small></button>}
      </div>
      <button type="button" className="unified-floating-trigger" aria-expanded={open} aria-label={open ? t(uiCopy.close_quick_actions_en, uiCopy.close_quick_actions_ar, 'Close quick actions') : t(uiCopy.open_quick_actions_en, uiCopy.open_quick_actions_ar, 'Open quick actions')} onClick={() => setOpen((current) => !current)}><span aria-hidden="true">{open ? '×' : '⋮'}</span><small>{t(uiCopy.menu_en, uiCopy.menu_ar, 'Menu')}</small></button>
    </div>
  )
}
