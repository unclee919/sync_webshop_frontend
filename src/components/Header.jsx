import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { getSearchSuggestions, getCategories } from '../api/client'
import './Header.css'

const Header = () => {
  const { content } = useContent()
  const theme = content?.theme
  const { lang, setLang, isRtl } = useLanguage()
  const { count } = useCart()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const suggestionRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Load categories for search dropdown
    getCategories().then(setCategories).catch(console.error)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (search.length > 1) {
      const timer = setTimeout(async () => {
        try {
          const res = await getSearchSuggestions(search)
          setSuggestions(res || [])
        } catch (err) {
          console.error(err)
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      const params = new URLSearchParams()
      params.set('search', search)
      if (selectedCategory) params.set('category', selectedCategory)
      navigate(`/products?${params.toString()}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'category') {
      navigate(`/products?category=${encodeURIComponent(suggestion.name)}`)
    } else {
      navigate(`/products/${encodeURIComponent(suggestion.item_code)}`)
    }
    setShowSuggestions(false)
    setSearch('')
  }

  const headerMaxWidth = theme?.dimensions?.header_max_width ? `${theme.dimensions.header_max_width}px` : '1200px'

  return (
    <div className={`site-header-wrapper ${isCompact ? 'compact' : ''} ${isRtl ? 'rtl' : ''}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container top-bar-inner" style={{ maxWidth: headerMaxWidth }}>
          <div className="top-bar-left">
            <Link to="/contact-us">{lang === 'ar' ? (content?.contact_us_text_ar || 'تواصل معنا') : (content?.contact_us_text_en || 'Contact Us')}</Link>
            <span className="separator">|</span>
            <Link to="/track">{lang === 'ar' ? (content?.track_order_text_ar || 'تتبع الطلب') : (content?.track_order_text_en || 'Track Order')}</Link>
          </div>
          <div className="top-bar-center">
            {content?.announcement?.enabled && (
              <div className="announcement-text">
                {lang === 'ar' ? content.announcement.message_ar : content.announcement.message_en}
              </div>
            )}
          </div>
          <div className="top-bar-right">
            <span className="contact-info">
              {lang === 'ar' ? (content?.need_help_text_ar || 'تحتاج مساعدة؟ اتصل بنا:') : (content?.need_help_text_en || 'Need help? Call us:')} 
              <strong> {content?.header_contact_number || content?.phone_number || '07341375333'}</strong>
            </span>
            <button className="lang-toggle" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="container header-inner" style={{ maxWidth: headerMaxWidth }}>
          <Link to="/" className="logo">
            {theme?.logo ? (
              <img src={theme.logo} alt={content?.site_name_en} />
            ) : (
              <span className="site-name">{isRtl ? content?.site_name_ar : content?.site_name_en}</span>
            )}
          </Link>

          <div className="search-area" ref={suggestionRef}>
            <form onSubmit={handleSearch} className="search-box">
              <div className="category-select-wrapper">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="">{lang === 'ar' ? (content?.all_categories_text_ar || 'جميع الفئات') : (content?.all_categories_text_en || 'All Categories')}</option>
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder={lang === 'ar' ? (content?.search_placeholder_ar || 'البحث عن العناصر...') : (content?.search_placeholder_en || 'Search for items...')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <button type="submit" className="search-submit-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-results">
                {suggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    className={`result-item ${s.type}-result`}
                    onClick={() => handleSuggestionClick(s)}
                  >
                    <div className="result-img-box">
                      {s.image ? (
                        <img src={s.image} alt="" />
                      ) : (
                        <span className="result-icon-placeholder">{s.type === 'category' ? '📁' : '📦'}</span>
                      )}
                    </div>
                    <div className="result-text">
                      <span className="result-name">{s.name}</span>
                      <span className="result-type">{s.type === 'category' ? (lang === 'ar' ? 'فئة' : 'Category') : (lang === 'ar' ? 'منتج' : 'Product')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="header-meta">
            <Link to="/wishlist" className="meta-item">
              <div className="meta-icon-box">
                <img src={content?.wishlist_icon || "https://oasismarket.co.uk/themes/oasismarket-child-2/imgs/theme/icons/icon-heart.svg"} alt="" />
                <span className="meta-badge">0</span>
              </div>
              <span className="meta-label">{lang === 'ar' ? (content?.wishlist_text_ar || 'قائمة الأمنيات') : (content?.wishlist_text_en || 'Wishlist')}</span>
            </Link>
            <Link to="/cart" className="meta-item">
              <div className="meta-icon-box">
                <img src={content?.cart_icon || "https://oasismarket.co.uk/themes/oasismarket-child-2/imgs/theme/icons/icon-cart.svg"} alt="" />
                {count > 0 && <span className="meta-badge">{count}</span>}
              </div>
              <span className="meta-label">{lang === 'ar' ? (content?.cart_text_ar || 'السلة') : (content?.cart_text_en || 'Cart')}</span>
            </Link>
            <Link to="/dashboard" className="meta-item">
              <div className="meta-icon-box">
                <img src={content?.account_icon || "https://oasismarket.co.uk/themes/oasismarket-child-2/imgs/theme/icons/icon-user.svg"} alt="" />
              </div>
              <span className="meta-label">{lang === 'ar' ? (content?.account_text_ar || 'الحساب') : (content?.account_text_en || 'Account')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Nav Section */}
      <nav className="bottom-nav">
        <div className="container nav-container" style={{ maxWidth: headerMaxWidth }}>
          <div className="browse-categories">
            <button className="browse-btn" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
              <span className="grid-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </span>
              {lang === 'ar' ? (content?.browse_categories_text_ar || 'تصفح جميع الفئات') : (content?.browse_categories_text_en || 'Browse All Categories')}
            </button>
            {showCategoryDropdown && (
              <div className="categories-menu">
                {categories.map(cat => (
                  <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`} onClick={() => setShowCategoryDropdown(false)}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="main-menu">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              {lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
            </Link>
            {content?.nav_links && content.nav_links.map((link, i) => (
              <Link key={i} to={link.link_url} className={location.pathname === link.link_url ? 'active' : ''}>
                {lang === 'ar' ? (link.label_ar || link.label_en) : link.label_en}
              </Link>
            ))}
          </div>
          <div className="hotline">
            <img src={content?.support_icon || "https://oasismarket.co.uk/themes/oasismarket-child-2/imgs/theme/icons/icon-headphone.svg"} alt="" />
            <div className="hotline-info">
              <span className="phone">{content?.header_contact_number || content?.phone_number || '07341375333'}</span>
              <span className="support-text">{lang === 'ar' ? (content?.support_center_text_ar || '24/7 مركز الدعم') : (content?.support_center_text_en || '24/7 Support Center')}</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
