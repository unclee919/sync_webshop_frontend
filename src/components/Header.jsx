import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { getCategories, getSearchSuggestions } from '../api/client'
import './Header.css'

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
}

function BagIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
}

function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.3-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" /></svg>
}

export default function Header() {
  const { content } = useContent()
  const { lang, setLang, isRtl } = useLanguage()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(null)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categories, setCategories] = useState([])

  const isArabic = lang === 'ar'
  const t = (en, ar, fallback = '') => (isArabic ? (ar || en || fallback) : (en || ar || fallback))
  const navLinks = (content?.nav_links || []).filter((link) => link.show_in_navbar !== 0 && link.show_in_navbar !== false)
  const featuredCategories = content?.featured_categories || []
  const logo = content?.theme?.logo
  const siteName = t(content?.site_name_en, content?.site_name_ar, content?.site_name || 'Sync Webshop')

  useEffect(() => {
    let mounted = true
    getCategories().then((result) => {
      if (mounted) setCategories(Array.isArray(result) ? result : [])
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([])
      return undefined
    }
    const timer = setTimeout(() => {
      getSearchSuggestions(search.trim()).then((result) => setSuggestions(Array.isArray(result) ? result : [])).catch(() => setSuggestions([]))
    }, 260)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const handleOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setShowCategories(false)
  }, [location.pathname, location.search])

  const handleSearch = (event) => {
    event.preventDefault()
    if (!search.trim()) {
      navigate('/products')
      return
    }
    navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    setShowSuggestions(false)
  }

  const categoryOptions = categories.length
    ? categories
    : featuredCategories.map((category) => ({ name: category.item_group, label: t(category.label_en, category.label_ar, category.item_group) }))

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
            <div className="utility-message">
              {content.announcement?.enabled
                ? t(content.announcement.message_en, content.announcement.message_ar)
                : t(content.top_bar_message_en, content.top_bar_message_ar, t('Fresh finds, delivered to your door.', 'منتجات مختارة، تصل إلى بابك.'))}
            </div>
            <div className="utility-actions">
              {content.phone_number && <a href={`tel:${content.phone_number}`}>{t(content.need_help_text_en, content.need_help_text_ar, 'Need help?')} <strong>{content.phone_number}</strong></a>}
              <button type="button" className="language-switch" onClick={() => setLang(isArabic ? 'en' : 'ar')} aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}>
                {isArabic ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-header">
        <div className="container header-inner">
          <button type="button" className="mobile-menu-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label={t('Open menu', 'فتح القائمة')} aria-expanded={mobileOpen}>
            <span /><span /><span />
          </button>
          <Link to="/" className="brand-mark" aria-label={siteName}>
            {logo ? <img src={logo} alt={siteName} /> : <><span className="brand-symbol">S</span><span className="brand-copy"><strong>{siteName}</strong><small>{t(content.tagline_en, content.tagline_ar, 'Shop with confidence')}</small></span></>}
          </Link>

          <div className="header-search" ref={searchRef}>
            <form className="search-form" onSubmit={handleSearch} role="search">
              <span className="search-leading"><SearchIcon /></span>
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t(content.search_placeholder_en, content.search_placeholder_ar, 'Search products, categories and more')}
                aria-label={t('Search products', 'البحث عن المنتجات')}
              />
              <button type="submit">{t('Search', 'بحث')}</button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button key={`${suggestion.item_code || suggestion.name}-${index}`} type="button" onClick={() => {
                    if (suggestion.type === 'category') navigate(`/products?category=${encodeURIComponent(suggestion.name)}`)
                    else navigate(`/products/${encodeURIComponent(suggestion.item_code)}`)
                    setSearch('')
                    setShowSuggestions(false)
                  }}>
                    <span className="suggestion-image">{suggestion.image ? <img src={suggestion.image} alt="" /> : <span>⌕</span>}</span>
                    <span><strong>{suggestion.name}</strong><small>{suggestion.type === 'category' ? t('Category', 'الفئة') : t('Product', 'المنتج')}</small></span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            {content.enable_wishlist !== 0 && <Link to="/wishlist" className="header-action" aria-label={t('Wishlist', 'المفضلة')}><span className="action-icon"><HeartIcon /></span><span className="action-label">{t(content.wishlist_text_en, content.wishlist_text_ar, 'Wishlist')}</span></Link>}
            <Link to="/cart" className="header-action cart-action" aria-label={t('Cart', 'السلة')}><span className="action-icon"><BagIcon />{count > 0 && <span className="action-count">{count}</span>}</span><span className="action-label">{t(content.cart_text_en, content.cart_text_ar, 'Cart')}</span></Link>
            <Link to="/dashboard" className="header-action account-action" aria-label={t('Account', 'الحساب')}><span className="action-icon"><UserIcon /></span><span className="action-label">{t(content.account_text_en, content.account_text_ar, 'Account')}</span></Link>
          </div>
        </div>
      </div>

      <nav className={`store-nav ${mobileOpen ? 'open' : ''}`}>
        <div className="container nav-inner">
          <div className="category-menu-wrap">
            <button type="button" className="category-menu-trigger" onClick={() => setShowCategories((value) => !value)} aria-expanded={showCategories}>
              <span className="category-grid-icon"><i /><i /><i /><i /></span>
              {t(content.browse_categories_text_en, content.browse_categories_text_ar, 'Browse categories')}
              <span className="chevron">⌄</span>
            </button>
            {showCategories && <div className="category-menu-dropdown">
              {categoryOptions.slice(0, 18).map((category) => <Link key={category.name} to={`/products?category=${encodeURIComponent(category.name)}`}>{category.label || category.name}</Link>)}
              <Link className="view-all-categories" to="/products">{t('View all products', 'عرض كل المنتجات')} <span>→</span></Link>
            </div>}
          </div>
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t('Home', 'الرئيسية')}</Link>
            <Link to="/products" className={location.pathname.startsWith('/products') ? 'active' : ''}>{t('All products', 'كل المنتجات')}</Link>
            <Link to="/features" className={location.pathname === '/features' ? 'active' : ''}>{t('Why shop with us', 'لماذا نحن')}</Link>
            {navLinks.slice(0, 5).map((link, index) => link.is_external ? <a key={`${link.link_url}-${index}`} href={link.link_url} target="_blank" rel="noreferrer">{t(link.label_en, link.label_ar)}</a> : <Link key={`${link.link_url}-${index}`} to={link.link_url}>{t(link.label_en, link.label_ar)}</Link>)}
          </div>
          {content.phone_number && <a className="support-pill" href={`tel:${content.phone_number}`}><span className="support-dot" />{t(content.support_center_text_en, content.support_center_text_ar, 'Support')} <strong>{content.phone_number}</strong></a>}
        </div>
      </nav>
    </header>
  )
}
