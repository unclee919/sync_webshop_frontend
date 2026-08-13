import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { getCategories, getItem, getSearchSuggestions, getPredictiveSearch, sendVoiceAction } from '../api/client'
import VoiceSearch from './VoiceSearch'
import VisualSearch from './VisualSearch'
import BrandSwitcher from './BrandSwitcher'
import CurrencySwitcher from './CurrencySwitcher'
import { formatStorefrontPrice } from '../utils/currency'
import './Header.css'

function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg> }
function BagIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg> }
function UserIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg> }
function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.3-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" /></svg> }

export default function Header({ onOpenCart }) {
  const { content } = useContent()
  const { lang, setLang, isRtl } = useLanguage()
  const { count, addItem } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(null)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [predictiveResult, setPredictiveResult] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categories, setCategories] = useState([])

  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const navLinks = (content?.nav_links || []).filter((link) => link.show_in_navbar !== 0)
  const masterTier = content?.master_tier || {}
  const ghostSearchEnabled = masterTier.ghost_search_enabled !== 0
  const dynamicPages = content?.dynamic_pages || {}
  const dynamicLinks = [
    { key: 'about', path: '/about-us', enabled: dynamicPages.about_enabled !== 0, show: dynamicPages.about_show_in_nav !== 0, en: dynamicPages.about_label_en, ar: dynamicPages.about_label_ar },
    { key: 'policy', path: '/our-policy', enabled: dynamicPages.policy_enabled !== 0, show: dynamicPages.policy_show_in_nav !== 0, en: dynamicPages.policy_label_en, ar: dynamicPages.policy_label_ar },
    { key: 'articles', path: '/articles', enabled: dynamicPages.articles_enabled !== 0, show: dynamicPages.articles_show_in_nav !== 0, en: dynamicPages.articles_label_en, ar: dynamicPages.articles_label_ar },
    { key: 'qa', path: '/qa', enabled: dynamicPages.qa_enabled !== 0, show: dynamicPages.qa_show_in_nav !== 0, en: dynamicPages.qa_label_en, ar: dynamicPages.qa_label_ar },
  ].filter((link) => dynamicPages.enabled !== 0 && link.enabled && link.show)
  const logo = content?.theme?.logo
  const menuMax = Math.max(1, Number(content?.mega_menu_max_categories) || 12)
  const menuTitle = t(content?.mega_menu_title_en, content?.mega_menu_title_ar, 'Browse categories')
  const renderCategoryTree = (items = [], depth = 0) => items.map((cat) => (
    <div className={`mega-menu-category depth-${depth}`} key={cat.name}>
      <Link className={depth === 0 ? 'mega-category-card' : ''} to={`/products?category=${encodeURIComponent(cat.name)}`} onClick={() => setShowCategories(false)}>
        {depth === 0 && <span className="mega-category-image">{cat.image ? <img src={cat.image} alt="" loading="lazy" /> : <span>{cat.label?.slice(0, 1) || cat.name?.slice(0, 1)}</span>}</span>}
        <span><strong>{cat.label || cat.name}</strong>{depth === 0 && <small>{t('Explore collection', 'استكشف المجموعة')}</small>}</span>
      </Link>
      {cat.children?.length > 0 && <div className="mega-menu-children">{renderCategoryTree(cat.children, depth + 1)}</div>}
    </div>
  ))
  const siteName = t(content?.site_name_en, content?.site_name_ar, content?.site_name || 'Sync Webshop')

  useEffect(() => {
    getCategories().then((result) => setCategories(Array.isArray(result) ? result : [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (search.trim().length < 2) { setSuggestions([]); return }
    const timer = setTimeout(() => {
      getSearchSuggestions(search.trim()).then((result) => setSuggestions(Array.isArray(result) ? result : [])).catch(() => setSuggestions([]))
    }, 260)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!ghostSearchEnabled || search.trim().length < 2) { setPredictiveResult(null); return }
    const timer = setTimeout(() => {
      getPredictiveSearch(search.trim(), 6).then((result) => setPredictiveResult(result || null)).catch(() => setPredictiveResult(null))
    }, 320)
    return () => clearTimeout(timer)
  }, [ghostSearchEnabled, search])

  useEffect(() => {
    const handleOutside = (event) => { if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false) }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => { setMobileOpen(false); setShowCategories(false) }, [location.pathname, location.search])

  const handleVoiceResult = async (text) => {
    const voiceEnabled = content?.enterprise_settings?.ai?.voice_actions_enabled !== 0
    if (voiceEnabled) {
      try {
        const action = await sendVoiceAction(text)
        if (action?.action === 'add_to_cart' && action.item_code) {
          const item = await getItem(action.item_code)
          addItem({ item_code: item.item_code, item_name: item.item_name, price: item.price, currency: item.currency, image: item.image }, 1)
          onOpenCart?.()
          return
        }
        if (action?.action === 'apply_coupon' && action.coupon_code) {
          sessionStorage.setItem('sync_webshop_voice_coupon', action.coupon_code)
        }
      } catch { /* fall back to normal search when voice action is unavailable */ }
    }
    setSearch(text)
    navigate(`/products?search=${encodeURIComponent(text)}`)
    setShowSuggestions(false)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    if (!search.trim()) { navigate('/products'); return }
    navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    setShowSuggestions(false)
  }

  return (
    <header className={`site-header ${isRtl ? 'rtl' : 'ltr'}`}>
      {content?.show_top_bar !== 0 && (
        <div className="utility-bar">
          <div className="container utility-inner">
            <div className="utility-links">
              <Link to="/contact-us">{t(content.contact_us_text_en, content.contact_us_text_ar, 'Contact us')}</Link>
              <span className="utility-divider">•</span>
              <Link to="/track">{t(content.track_order_text_en, content.track_order_text_ar, 'Track order')}</Link>
            </div>
            <div className="utility-message">{t(content.top_bar_message_en, content.top_bar_message_ar, 'Fresh finds, delivered to your door.')}</div>
            <div className="utility-actions">
              {content.phone_number && <a href={`tel:${content.phone_number}`}>{t(content.need_help_text_en, content.need_help_text_ar, 'Need help?')} <strong>{content.phone_number}</strong></a>}
              <CurrencySwitcher />
              <button type="button" className="language-switch" onClick={() => setLang(isArabic ? 'en' : 'ar')}>{isArabic ? 'English' : 'العربية'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="main-header">
        <div className="container header-inner">
          <button type="button" className="mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t(content?.open_menu_text_en, content?.open_menu_text_ar, 'Open menu')}>
            <span /><span /><span />
          </button>
          <Link to="/" className="brand-mark">
            {logo ? <img src={logo} alt={siteName} width="190" height="52" decoding="async" /> : <><span className="brand-symbol">S</span><span className="brand-copy"><strong>{siteName}</strong><small>{t(content.tagline_en, content.tagline_ar, 'Everyday essentials, thoughtfully selected.')}</small></span></>}
          </Link>
          <BrandSwitcher />

          <div className="header-search" ref={searchRef}>
            <form className="search-form" onSubmit={handleSearch}>
              <span className="search-leading"><SearchIcon /></span>
<input value={search} onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true) }} onFocus={() => setShowSuggestions(true)} placeholder={t(content.search_placeholder_en, content.search_placeholder_ar, 'Search products, categories and more')} />
	              <VoiceSearch onResult={handleVoiceResult} />
                      <VisualSearch />
	              <button type="submit">{t(content?.search_button_text_en, content?.search_button_text_ar, 'Search')}</button>
	            </form>
            {showSuggestions && (suggestions.length > 0 || predictiveResult?.ghost) && (
              <div className="search-suggestions">
                {predictiveResult?.ghost && <button type="button" className="search-ghost-result" onClick={() => { navigate(`/products/${encodeURIComponent(predictiveResult.ghost.item_code)}`); setSearch(''); setShowSuggestions(false) }}><span className="suggestion-image">{predictiveResult.ghost.image ? <img src={predictiveResult.ghost.image} alt="" /> : <span>⌕</span>}</span><span><strong>{predictiveResult.ghost.item_name}</strong><small>{t('Best match', 'أفضل تطابق')}{predictiveResult.ghost.price != null ? ` · ${formatStorefrontPrice(predictiveResult.ghost.price, predictiveResult.ghost.currency, content)}` : ''}</small></span></button>}
                {suggestions.slice(0, 6).map((s, i) => (
                  <button key={i} type="button" onClick={() => { navigate(s.type === 'category' ? `/products?category=${encodeURIComponent(s.id)}` : `/products/${encodeURIComponent(s.id)}`); setSearch(''); setShowSuggestions(false) }}>
                    <span className="suggestion-image">{s.image ? <img src={s.image} alt="" /> : <span>⌕</span>}</span>
                    <span><strong>{s.name}</strong><small>{s.type === 'category' ? t('Category', 'الفئة') : `${t('Product', 'المنتج')}${s.price != null ? ` · ${formatStorefrontPrice(s.price, s.currency, content)}` : ''}`}</small></span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            {content.enable_wishlist !== 0 && <Link to="/wishlist" className="header-action"><span className="action-icon"><HeartIcon /></span><span className="action-label">{t(content.wishlist_text_en, content.wishlist_text_ar, 'Wishlist')}</span></Link>}
            <button type="button" className="header-action cart-action" onClick={() => onOpenCart?.()} aria-label={t(content.cart_text_en, content.cart_text_ar, 'Cart')}><span className="action-icon"><BagIcon />{count > 0 && <span className="action-count">{count}</span>}</span><span className="action-label">{t(content.cart_text_en, content.cart_text_ar, 'Cart')}</span></button>
            <Link to="/dashboard" className="header-action account-action"><span className="action-icon"><UserIcon /></span><span className="action-label">{t(content.account_text_en, content.account_text_ar, 'Account')}</span></Link>
          </div>
        </div>
      </div>

      <nav className={`store-nav ${mobileOpen ? 'open' : ''}`}>
        <div className="container nav-inner">
          {content?.mega_menu_enabled !== 0 && <div className="category-menu-wrap">
            <button type="button" className="category-menu-trigger" onClick={() => setShowCategories(!showCategories)}>
              <span className="category-grid-icon"><i /><i /><i /><i /></span>
              {menuTitle}
              <span className="chevron">⌄</span>
            </button>
            {showCategories && <div className="mega-menu-dropdown">
              <div className="mega-menu-grid">
                <div className="mega-menu-list">{renderCategoryTree(categories.slice(0, menuMax))}</div>
                {(content?.mega_menu_featured_image || content?.mega_menu_featured_title_en || content?.mega_menu_featured_title_ar) && <div className="mega-menu-featured">
                  <div className="mega-featured-card">
                    {content?.mega_menu_featured_image && <img src={content.mega_menu_featured_image} alt={t(content.mega_menu_featured_title_en, content.mega_menu_featured_title_ar, menuTitle)} />}
                    <div className="mega-featured-copy">
                      <h4>{t(content.mega_menu_featured_title_en, content.mega_menu_featured_title_ar, menuTitle)}</h4>
                      {content?.mega_menu_featured_url && <Link to={content.mega_menu_featured_url} onClick={() => setShowCategories(false)}>{t(content.shop_now_text_en, content.shop_now_text_ar, 'Shop now')} →</Link>}
                    </div>
                  </div>
                </div>}
              </div>
            </div>}
          </div>}
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t(content?.home_text_en, content?.home_text_ar, 'Home')}</Link>
            <Link to="/products" className={location.pathname.startsWith('/products') ? 'active' : ''}>{t(content?.all_products_text_en, content?.all_products_text_ar, 'All products')}</Link>
            <Link to="/features" className={location.pathname === '/features' ? 'active' : ''}>{t(content?.why_us_text_en, content?.why_us_text_ar, 'Why shop with us')}</Link>
            {dynamicLinks.map((link) => <Link key={link.key} to={link.path} className={location.pathname === link.path || (link.key === 'articles' && location.pathname.startsWith('/articles/')) ? 'active' : ''}>{t(link.en, link.ar)}</Link>)}
            {navLinks.map((link, i) => link.is_external ? <a key={i} href={link.link_url} target="_blank" rel="noreferrer">{t(link.label_en, link.label_ar)}</a> : <Link key={i} to={link.link_url}>{t(link.label_en, link.label_ar)}</Link>)}
          </div>
          {content.phone_number && <a className="support-pill" href={`tel:${content.phone_number}`}><span className="support-dot" />{t(content.support_center_text_en, content.support_center_text_ar, 'Support')} <strong>{content.phone_number}</strong></a>}
        </div>
      </nav>
    </header>
  )
}
